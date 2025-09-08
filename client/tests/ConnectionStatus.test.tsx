import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { act } from "react";
import ConnectionStatus from "../src/components/ConnectionStatus";

// Mock the useNetworkStatus hook
const mockNetworkStatus = {
  isOnline: true,
  isConnecting: false,
  connectionQuality: "good" as const,
  lastDisconnected: null,
  reconnectAttempts: 0,
};

vi.mock("../src/hooks/useNetworkStatus", () => ({
  useNetworkStatus: () => mockNetworkStatus,
}));

describe("ConnectionStatus", () => {
  beforeEach(() => {
    // Reset mock state before each test
    Object.assign(mockNetworkStatus, {
      isOnline: true,
      isConnecting: false,
      connectionQuality: "good",
      lastDisconnected: null,
      reconnectAttempts: 0,
    });
  });

  it("does not render when connection is good and online", () => {
    const { container } = render(<ConnectionStatus />);
    expect(container.firstChild).toBeNull();
  });

  it("shows connected status when explicitly requested to show when online", async () => {
    await act(async () => {
      Object.assign(mockNetworkStatus, {
        isOnline: true,
        connectionQuality: "good",
      });
    });

    render(<ConnectionStatus showWhenOnline={true} />);

    expect(screen.getByText(/connected/i)).toBeInTheDocument();
    expect(screen.getByText("✅")).toBeInTheDocument();
  });

  it("shows offline status when disconnected", async () => {
    await act(async () => {
      Object.assign(mockNetworkStatus, {
        isOnline: false,
        isConnecting: false,
        connectionQuality: "offline",
      });
    });

    render(<ConnectionStatus />);

    expect(screen.getByText(/you're offline/i)).toBeInTheDocument();
    expect(screen.getByText("📵")).toBeInTheDocument();
  });

  it("shows connecting status when reconnecting", async () => {
    await act(async () => {
      Object.assign(mockNetworkStatus, {
        isOnline: false,
        isConnecting: true,
        connectionQuality: "offline",
      });
    });

    render(<ConnectionStatus />);

    expect(screen.getByText(/reconnecting/i)).toBeInTheDocument();
    expect(screen.getByText("🔄")).toBeInTheDocument();
  });

  it("shows slow connection warning when online but slow", async () => {
    await act(async () => {
      Object.assign(mockNetworkStatus, {
        isOnline: true,
        isConnecting: false,
        connectionQuality: "slow",
      });
    });

    render(<ConnectionStatus showWhenOnline={true} />);

    expect(screen.getByText(/slow connection/i)).toBeInTheDocument();
    expect(screen.getByText("🐌")).toBeInTheDocument();
  });

  it("shows connecting status even when transitioning", async () => {
    await act(async () => {
      Object.assign(mockNetworkStatus, {
        isOnline: true,
        isConnecting: true,
        connectionQuality: "good",
      });
    });

    render(<ConnectionStatus />);

    expect(screen.getByText(/reconnecting/i)).toBeInTheDocument();
    expect(screen.getByText("🔄")).toBeInTheDocument();
  });

  it("applies correct styling based on connection state", async () => {
    // Test offline state
    await act(async () => {
      Object.assign(mockNetworkStatus, {
        isOnline: false,
        isConnecting: false,
        connectionQuality: "offline",
      });
    });

    const { rerender } = render(<ConnectionStatus />);
    let statusElement = screen
      .getByText(/you're offline/i)
      .closest(".connection-status");
    expect(statusElement).toHaveStyle("background-color: rgb(244, 67, 54)"); // Red for offline

    // Test slow connection state
    await act(async () => {
      Object.assign(mockNetworkStatus, {
        isOnline: true,
        isConnecting: false,
        connectionQuality: "slow",
      });
    });

    rerender(<ConnectionStatus showWhenOnline={true} />);
    statusElement = screen
      .getByText(/slow connection/i)
      .closest(".connection-status");
    expect(statusElement).toHaveStyle("background-color: rgb(255, 152, 0)"); // Orange for slow

    // Test connected state
    await act(async () => {
      Object.assign(mockNetworkStatus, {
        isOnline: true,
        isConnecting: false,
        connectionQuality: "good",
      });
    });

    rerender(<ConnectionStatus showWhenOnline={true} />);
    statusElement = screen
      .getByText(/connected/i)
      .closest(".connection-status");
    expect(statusElement).toHaveStyle("background-color: rgb(76, 175, 80)"); // Green for good
  });
});
