import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import QRLoginModal from "../src/components/QRLoginModal";
import { AuthProvider } from "../src/context/AuthContext";
import { MockedProvider } from "@apollo/client/testing";
import { LOGIN_WITH_QR_TOKEN } from "../src/features/auth/graphql/loginWithQrToken";

const qrToken = "test-qr-token-123";
const user = {
  _id: "1",
  fullName: "Test User",
  email: "test@example.com",
  isInvited: true,
  qrToken,
};

const loginMock = {
  request: {
    query: LOGIN_WITH_QR_TOKEN,
    variables: { qrToken },
  },
  result: {
    data: {
      loginWithQrToken: {
        token: "mock-token",
        user,
      },
    },
  },
};

describe("QRLoginModal", () => {
  it("logs in user with valid QR token", async () => {
    const onLoginSuccess = vi.fn();
    render(
      <MockedProvider mocks={[loginMock]} addTypename={false}>
        <AuthProvider>
          <QRLoginModal
            isOpen={true}
            onClose={() => {}}
            onLoginSuccess={onLoginSuccess}
            testScanValue={qrToken}
          />
        </AuthProvider>
      </MockedProvider>
    );
    // Modal renders and shows instructions
    expect(
      screen.getByText(/use your phone's camera app to scan/i)
    ).toBeInTheDocument();
    // Wait for login to complete and success callback to be called
    await waitFor(
      () => {
        expect(onLoginSuccess).toHaveBeenCalled();
      },
      { timeout: 3000 }
    );
  });
});
