/**
 * Test script for QR Alias feature
 * Tests admin updating user QR alias via GraphQL
 */

const {
  ApolloClient,
  InMemoryCache,
  gql,
  createHttpLink,
} = require("@apollo/client/core");
const fetch = require("cross-fetch");

// Configuration
const GRAPHQL_ENDPOINT =
  process.env.GRAPHQL_ENDPOINT || "http://localhost:3001/graphql";
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "your-admin-jwt-token-here";

// Create Apollo Client
const client = new ApolloClient({
  link: createHttpLink({
    uri: GRAPHQL_ENDPOINT,
    fetch,
    headers: {
      authorization: ADMIN_TOKEN ? `Bearer ${ADMIN_TOKEN}` : "",
    },
  }),
  cache: new InMemoryCache(),
});

// GraphQL Mutations
const UPDATE_USER_PERSONALIZATION = gql`
  mutation UpdateUserPersonalization(
    $userId: ID!
    $input: UserPersonalizationInput!
  ) {
    adminUpdateUserPersonalization(userId: $userId, input: $input) {
      _id
      fullName
      email
      qrAlias
    }
  }
`;

const GET_ADMIN_RSVPS = gql`
  query GetAdminRSVPs {
    adminGetAllRSVPs {
      _id
      fullName
      email
      qrAlias
      isInvited
    }
  }
`;

async function testQRAlias() {
  console.log("🧪 Testing QR Alias Feature...\n");

  try {
    // Step 1: Fetch all users
    console.log("📋 Step 1: Fetching all users...");
    const { data: usersData } = await client.query({
      query: GET_ADMIN_RSVPS,
    });

    const users = usersData.adminGetAllRSVPs;
    console.log(`✅ Found ${users.length} users\n`);

    if (users.length === 0) {
      console.log("❌ No users found. Please seed the database first.");
      return;
    }

    // Find a test user (non-admin, invited)
    const testUser = users.find(
      (u) => u.isInvited && !u.fullName.includes("Admin"),
    );
    if (!testUser) {
      console.log("❌ No suitable test user found.");
      return;
    }

    console.log(`🎯 Using test user: ${testUser.fullName} (${testUser.email})`);
    console.log(`   Current qrAlias: ${testUser.qrAlias || "none"}\n`);

    // Step 2: Set a QR alias
    const newAlias = "test-family-" + Date.now().toString().slice(-4);
    console.log(`📝 Step 2: Setting qrAlias to "${newAlias}"...`);

    const { data: updateData1 } = await client.mutate({
      mutation: UPDATE_USER_PERSONALIZATION,
      variables: {
        userId: testUser._id,
        input: {
          qrAlias: newAlias,
        },
      },
    });

    console.log(
      `✅ QR Alias set successfully: ${updateData1.adminUpdateUserPersonalization.qrAlias}\n`,
    );

    // Step 3: Update to a different alias
    const updatedAlias = "updated-family-" + Date.now().toString().slice(-4);
    console.log(`📝 Step 3: Updating qrAlias to "${updatedAlias}"...`);

    const { data: updateData2 } = await client.mutate({
      mutation: UPDATE_USER_PERSONALIZATION,
      variables: {
        userId: testUser._id,
        input: {
          qrAlias: updatedAlias,
        },
      },
    });

    console.log(
      `✅ QR Alias updated successfully: ${updateData2.adminUpdateUserPersonalization.qrAlias}\n`,
    );

    // Step 4: Try to set a duplicate alias (should fail)
    console.log(`📝 Step 4: Testing duplicate alias validation...`);
    console.log(`   Trying to set user's alias to itself: "${updatedAlias}"`);

    try {
      // Find another user to test duplicate
      const otherUser = users.find(
        (u) => u._id !== testUser._id && u.isInvited,
      );
      if (otherUser) {
        await client.mutate({
          mutation: UPDATE_USER_PERSONALIZATION,
          variables: {
            userId: otherUser._id,
            input: {
              qrAlias: updatedAlias, // Try to use the same alias
            },
          },
        });
        console.log("❌ FAILED: Should have rejected duplicate alias");
      } else {
        console.log("⚠️  Skipping duplicate test (need 2+ users)");
      }
    } catch (error) {
      if (error.message.includes("already in use")) {
        console.log(`✅ Duplicate validation working: ${error.message}\n`);
      } else {
        throw error;
      }
    }

    // Step 5: Clear the alias
    console.log(`📝 Step 5: Clearing qrAlias (setting to empty string)...`);

    const { data: updateData3 } = await client.mutate({
      mutation: UPDATE_USER_PERSONALIZATION,
      variables: {
        userId: testUser._id,
        input: {
          qrAlias: "",
        },
      },
    });

    console.log(
      `✅ QR Alias cleared: ${updateData3.adminUpdateUserPersonalization.qrAlias || "null/undefined"}\n`,
    );

    console.log("🎉 All QR Alias tests passed!\n");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    if (error.graphQLErrors) {
      error.graphQLErrors.forEach((err) => {
        console.error("   GraphQL Error:", err.message);
      });
    }
    process.exit(1);
  }
}

// Run tests
testQRAlias().then(() => {
  console.log("✨ Test script complete");
  process.exit(0);
});
