#!/usr/bin/env node

/**
 * Automated GraphQL RSVP Debugging Script
 *
 * This script will systematically test all RSVP scenarios using GraphQL
 * to identify validation issues and debug the RSVP submission problems.
 */

const fetch = require("node-fetch");

const GRAPHQL_ENDPOINT = "http://localhost:3001/graphql";
const CHARLIE_USER_ID = "688ea0db64389185e3317afc";
const CHARLIE_QR_TOKEN = "ss0qx6mg20f2qaiyl9hnl7";

// Colors for console output
const colors = {
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  reset: "\x1b[0m",
  bold: "\x1b[1m",
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

async function graphqlQuery(query, variables = {}, authToken = null) {
  try {
    const headers = {
      "Content-Type": "application/json",
    };

    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
    }

    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers,
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    const result = await response.json();
    return {
      success: !result.errors,
      data: result.data,
      errors: result.errors,
      status: response.status,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

async function authenticateAsCharlie() {
  log("\n🔐 Authenticating as Charlie Williams...", colors.blue);

  const mutation = `
    mutation QRLogin($token: String!) {
      loginWithQrToken(qrToken: $token) {
        token
        user {
          _id
          fullName
          email
          isInvited
        }
      }
    }
  `;

  const authResult = await graphqlQuery(mutation, { token: CHARLIE_QR_TOKEN });

  if (authResult.success && authResult.data.loginWithQrToken) {
    log(`✅ Authenticated successfully!`, colors.green);
    log(`   User: ${authResult.data.loginWithQrToken.user.fullName}`);
    log(`   Email: ${authResult.data.loginWithQrToken.user.email}`);
    log(`   Invited: ${authResult.data.loginWithQrToken.user.isInvited}`);
    return authResult.data.loginWithQrToken.token;
  } else {
    log(`❌ Authentication failed:`, colors.red);
    if (authResult.errors) {
      authResult.errors.forEach((error) =>
        log(`   ${error.message}`, colors.red)
      );
    }
    return null;
  }
}

async function testUserExists(authToken) {
  log("\n🔍 Testing: Check current authenticated user...", colors.blue);

  const query = `
    query Me {
      me {
        _id
        fullName
        email
        isInvited
        qrToken
      }
    }
  `;

  const result = await graphqlQuery(query, {}, authToken);

  if (result.success && result.data.me) {
    log(`✅ User authenticated: ${result.data.me.fullName}`, colors.green);
    log(`   Email: ${result.data.me.email}`);
    log(`   Invited: ${result.data.me.isInvited}`);
    log(`   User ID: ${result.data.me._id}`);
    return true;
  } else {
    log(`❌ User authentication check failed:`, colors.red);
    if (result.errors) {
      result.errors.forEach((error) => log(`   ${error.message}`, colors.red));
    }
    return false;
  }
}

async function checkExistingRSVP(authToken) {
  log("\n🔍 Testing: Check for existing RSVP...", colors.blue);

  const query = `
    query GetRSVP {
      getRSVP {
        _id
        userId
        attending
        guestCount
        guests {
          fullName
          mealPreference
          allergies
        }
        additionalNotes
        fullName
        mealPreference
        allergies
        createdAt
        updatedAt
      }
    }
  `;

  const result = await graphqlQuery(query, {}, authToken);

  if (result.success && result.data.getRSVP) {
    log(`✅ Existing RSVP found:`, colors.green);
    log(`   Attending: ${result.data.getRSVP.attending}`);
    log(`   Guest Count: ${result.data.getRSVP.guestCount}`);
    log(`   Legacy Full Name: ${result.data.getRSVP.fullName}`);
    log(`   Legacy Meal Preference: ${result.data.getRSVP.mealPreference}`);
    log(`   Guests: ${JSON.stringify(result.data.getRSVP.guests, null, 2)}`);
    return result.data.getRSVP;
  } else if (result.success && !result.data.getRSVP) {
    log(`ℹ️  No existing RSVP found`, colors.yellow);
    return null;
  } else {
    log(`❌ Error checking RSVP:`, colors.red);
    if (result.errors) {
      result.errors.forEach((error) => log(`   ${error.message}`, colors.red));
    }
    return false;
  }
}

async function deleteExistingRSVP() {
  log("\n🗑️  Deleting existing RSVP for clean test...", colors.yellow);

  // We'll need to add a delete mutation or do it directly via MongoDB
  // For now, let's create a simple delete mutation test
  const query = `
    mutation DeleteRSVP($userId: ID!) {
      deleteRSVP(userId: $userId) {
        success
        message
      }
    }
  `;

  const result = await graphqlQuery(query, { userId: CHARLIE_USER_ID });

  if (result.success) {
    log(`✅ RSVP deleted successfully`, colors.green);
    return true;
  } else {
    log(
      `ℹ️  Delete mutation not available or RSVP doesn't exist`,
      colors.yellow
    );
    return true; // Continue anyway
  }
}

async function testCreateNonAttendingRSVP(authToken) {
  log("\n🔍 Testing: Create non-attending RSVP...", colors.blue);

  const mutation = `
    mutation CreateRSVP($input: CreateRSVPInput!) {
      createRSVP(input: $input) {
        _id
        userId
        attending
        guestCount
        guests {
          fullName
          mealPreference
          allergies
        }
        additionalNotes
        fullName
        mealPreference
        allergies
      }
    }
  `;

  const variables = {
    input: {
      attending: "NO",
      guestCount: 1,
      guests: [
        {
          fullName: "",
          mealPreference: "",
          allergies: "",
        },
      ],
      additionalNotes: "",
      fullName: "Charlie Williams",
      mealPreference: "",
      allergies: "",
    },
  };

  const result = await graphqlQuery(mutation, variables, authToken);

  if (result.success) {
    log(`✅ Non-attending RSVP created successfully!`, colors.green);
    log(`   ID: ${result.data.createRSVP._id}`);
    log(`   Attending: ${result.data.createRSVP.attending}`);
    return result.data.createRSVP;
  } else {
    log(`❌ Failed to create non-attending RSVP:`, colors.red);
    if (result.errors) {
      result.errors.forEach((error) => {
        log(`   ${error.message}`, colors.red);
        log(
          `   Path: ${error.path ? error.path.join(".") : "N/A"}`,
          colors.red
        );
        log(
          `   Extensions: ${JSON.stringify(error.extensions, null, 2)}`,
          colors.red
        );
      });
    }
    return false;
  }
}

async function testCreateMaybeRSVP() {
  log("\n🔍 Testing: Create maybe RSVP...", colors.blue);

  const mutation = `
    mutation CreateRSVP($input: CreateRSVPInput!) {
      createRSVP(input: $input) {
        _id
        userId
        attending
        guestCount
        guests {
          fullName
          mealPreference
          allergies
        }
        additionalNotes
      }
    }
  `;

  const variables = {
    input: {
      userId: CHARLIE_USER_ID,
      attending: "MAYBE",
      guestCount: 1,
      guests: [
        {
          fullName: "",
          mealPreference: "",
          allergies: "",
        },
      ],
      additionalNotes: "Not sure about travel plans yet",
      fullName: "Charlie Williams",
      mealPreference: "",
      allergies: "",
    },
  };

  const result = await graphqlQuery(mutation, variables);

  if (result.success) {
    log(`✅ Maybe RSVP created successfully!`, colors.green);
    return result.data.createRSVP;
  } else {
    log(`❌ Failed to create maybe RSVP:`, colors.red);
    if (result.errors) {
      result.errors.forEach((error) => {
        log(`   ${error.message}`, colors.red);
      });
    }
    return false;
  }
}

async function testCreateAttendingRSVP() {
  log("\n🔍 Testing: Create attending RSVP...", colors.blue);

  const mutation = `
    mutation CreateRSVP($input: CreateRSVPInput!) {
      createRSVP(input: $input) {
        _id
        userId
        attending
        guestCount
        guests {
          fullName
          mealPreference
          allergies
        }
        additionalNotes
      }
    }
  `;

  const variables = {
    input: {
      userId: CHARLIE_USER_ID,
      attending: "YES",
      guestCount: 1,
      guests: [
        {
          fullName: "Charlie Williams",
          mealPreference: "chicken",
          allergies: "None",
        },
      ],
      additionalNotes: "Looking forward to it!",
      fullName: "Charlie Williams",
      mealPreference: "chicken",
      allergies: "None",
    },
  };

  const result = await graphqlQuery(mutation, variables);

  if (result.success) {
    log(`✅ Attending RSVP created successfully!`, colors.green);
    return result.data.createRSVP;
  } else {
    log(`❌ Failed to create attending RSVP:`, colors.red);
    if (result.errors) {
      result.errors.forEach((error) => {
        log(`   ${error.message}`, colors.red);
      });
    }
    return false;
  }
}

async function testEditRSVP(existingRSVP) {
  log("\n🔍 Testing: Edit existing RSVP...", colors.blue);

  const mutation = `
    mutation EditRSVP($userId: ID!, $input: RSVPInput!) {
      editRSVP(userId: $userId, input: $input) {
        _id
        userId
        attending
        guestCount
        guests {
          fullName
          mealPreference
          allergies
        }
        additionalNotes
      }
    }
  `;

  const variables = {
    userId: CHARLIE_USER_ID,
    input: {
      attending: "NO",
      guestCount: 1,
      guests: [
        {
          fullName: "",
          mealPreference: "",
          allergies: "",
        },
      ],
      additionalNotes: "Sorry, can't make it after all",
    },
  };

  const result = await graphqlQuery(mutation, variables);

  if (result.success) {
    log(`✅ RSVP edited successfully!`, colors.green);
    return result.data.editRSVP;
  } else {
    log(`❌ Failed to edit RSVP:`, colors.red);
    if (result.errors) {
      result.errors.forEach((error) => {
        log(`   ${error.message}`, colors.red);
      });
    }
    return false;
  }
}

async function testSchemaIntrospection() {
  log("\n🔍 Testing: Schema introspection...", colors.blue);

  const query = `
    query IntrospectSchema {
      __schema {
        mutationType {
          fields {
            name
            args {
              name
              type {
                name
                kind
              }
            }
          }
        }
      }
    }
  `;

  const result = await graphqlQuery(query);

  if (result.success) {
    const mutations = result.data.__schema.mutationType.fields;
    const rsvpMutations = mutations.filter((field) =>
      field.name.toLowerCase().includes("rsvp")
    );

    log(`✅ Available RSVP mutations:`, colors.green);
    rsvpMutations.forEach((mutation) => {
      log(`   - ${mutation.name}`, colors.green);
      mutation.args.forEach((arg) => {
        log(
          `     ${arg.name}: ${arg.type.name || arg.type.kind}`,
          colors.green
        );
      });
    });
    return true;
  } else {
    log(`❌ Schema introspection failed:`, colors.red);
    return false;
  }
}

async function runAllTests() {
  log(
    `${colors.bold}🚀 Starting Automated GraphQL RSVP Tests${colors.reset}\n`
  );

  try {
    // Step 1: Authenticate as Charlie
    const authToken = await authenticateAsCharlie();
    if (!authToken) {
      log(`❌ Cannot continue without authentication`, colors.red);
      return;
    }

    // Step 2: Check if user exists (with auth)
    const userExists = await testUserExists(authToken);
    if (!userExists) {
      log(`❌ Cannot continue without valid user`, colors.red);
      return;
    }

    // Step 3: Schema introspection
    await testSchemaIntrospection();

    // Step 4: Check existing RSVP
    const existingRSVP = await checkExistingRSVP(authToken);

    // Step 5: Test creating non-attending RSVP
    log(
      `\n${colors.bold}🎯 Main Test: Creating Non-Attending RSVP${colors.reset}`
    );
    const createResult = await testCreateNonAttendingRSVP(authToken);

    if (createResult) {
      log(
        `\n${colors.bold}✅ SUCCESS: Non-attending RSVP created successfully!${colors.reset}`,
        colors.green
      );
      log(
        `This means the validation fixes are working correctly.`,
        colors.green
      );
    } else {
      log(
        `\n${colors.bold}❌ FAILURE: Could not create non-attending RSVP${colors.reset}`,
        colors.red
      );
      log(
        `This indicates there are still validation issues to fix.`,
        colors.red
      );
    }

    log(`\n${colors.bold}📊 Test Summary${colors.reset}`);
    log(`- Authentication: ${authToken ? "✅" : "❌"}`);
    log(`- User exists: ${userExists ? "✅" : "❌"}`);
    log(
      `- Existing RSVP: ${
        existingRSVP
          ? "✅ Found"
          : existingRSVP === null
          ? "ℹ️  None"
          : "❌ Error"
      }`
    );
    log(`- Create non-attending RSVP: ${createResult ? "✅" : "❌"}`);
  } catch (error) {
    log(`❌ Test suite failed with error: ${error.message}`, colors.red);
    console.error(error);
  }
}

// Run the tests
runAllTests().catch(console.error);
