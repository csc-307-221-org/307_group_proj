import { jest } from "@jest/globals";

const statusMock = jest.fn();
const sendMock = jest.fn();
const endMock = jest.fn();
const nextMock = jest.fn();

function mockResponse() {
  statusMock.mockReturnValue({
    send: sendMock,
    end: endMock,
  });

  return {
    status: statusMock,
  };
}

const mockFindOne = jest.fn();
const mockSave = jest.fn();

const UserMock = jest.fn(() => ({
  save: mockSave,
}));

UserMock.findOne = mockFindOne;

const bcryptMock = {
  genSalt: jest.fn(),
  hash: jest.fn(),
  compare: jest.fn(),
};

const jwtMock = {
  sign: jest.fn(),
  verify: jest.fn(),
};

jest.unstable_mockModule("../src/models/User.js", () => ({
  default: UserMock,
}));

jest.unstable_mockModule("bcrypt", () => ({
  default: bcryptMock,
}));

jest.unstable_mockModule("jsonwebtoken", () => ({
  default: jwtMock,
}));

const { registerUser, loginUser, authenticateUser } =
  await import("../src/auth.js");

describe("auth", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.TOKEN_SECRET = "test-secret";
  });

  test("registerUser returns 400 when username or password is missing", () => {
    const req = {
      body: {
        username: "",
        pwd: "",
      },
    };

    const res = mockResponse();

    registerUser(req, res);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(sendMock).toHaveBeenCalledWith("Bad request: Invalid input data.");
  });

  test("registerUser returns 409 when username already exists", async () => {
    mockFindOne.mockResolvedValue({
      username: "testuser",
    });

    const req = {
      body: {
        username: "testuser",
        pwd: "password123",
      },
    };

    const res = mockResponse();

    registerUser(req, res);

    await Promise.resolve();

    expect(mockFindOne).toHaveBeenCalledWith({
      username: "testuser",
    });
    expect(statusMock).toHaveBeenCalledWith(409);
    expect(sendMock).toHaveBeenCalledWith("Username already taken");
  });

  test("registerUser creates user and returns token", async () => {
    mockFindOne.mockResolvedValue(null);
    bcryptMock.genSalt.mockResolvedValue("salt");
    bcryptMock.hash.mockResolvedValue("hashed-password");
    mockSave.mockResolvedValue({
      _id: "user1",
      username: "testuser",
    });
    jwtMock.sign.mockImplementation((payload, secret, options, callback) => {
      callback(null, "signed-token");
    });

    const req = {
      body: {
        username: "testuser",
        pwd: "password123",
      },
    };

    const res = mockResponse();

    registerUser(req, res);

    await new Promise((resolve) => setImmediate(resolve));

    expect(bcryptMock.genSalt).toHaveBeenCalledWith(10);
    expect(bcryptMock.hash).toHaveBeenCalledWith("password123", "salt");
    expect(mockSave).toHaveBeenCalled();
    expect(jwtMock.sign).toHaveBeenCalled();
    expect(statusMock).toHaveBeenCalledWith(201);
    expect(sendMock).toHaveBeenCalledWith({
      token: "signed-token",
    });
  });

  test("loginUser returns 401 when user is not found", async () => {
    mockFindOne.mockResolvedValue(null);

    const req = {
      body: {
        username: "missinguser",
        pwd: "password123",
      },
    };

    const res = mockResponse();

    loginUser(req, res);

    await Promise.resolve();

    expect(statusMock).toHaveBeenCalledWith(401);
    expect(sendMock).toHaveBeenCalledWith("Unauthorized");
  });

  test("loginUser returns 401 when password does not match", async () => {
    mockFindOne.mockResolvedValue({
      _id: "user1",
      username: "testuser",
      hashedPassword: "hashed-password",
    });

    bcryptMock.compare.mockResolvedValue(false);

    const req = {
      body: {
        username: "testuser",
        pwd: "wrongpassword",
      },
    };

    const res = mockResponse();

    loginUser(req, res);

    await Promise.resolve();
    await Promise.resolve();

    expect(bcryptMock.compare).toHaveBeenCalledWith(
      "wrongpassword",
      "hashed-password",
    );
    expect(statusMock).toHaveBeenCalledWith(401);
    expect(sendMock).toHaveBeenCalledWith("Unauthorized");
  });

  test("loginUser returns token when credentials match", async () => {
    mockFindOne.mockResolvedValue({
      _id: "user1",
      username: "testuser",
      hashedPassword: "hashed-password",
    });

    bcryptMock.compare.mockResolvedValue(true);
    jwtMock.sign.mockImplementation((payload, secret, options, callback) => {
      callback(null, "login-token");
    });

    const req = {
      body: {
        username: "testuser",
        pwd: "password123",
      },
    };

    const res = mockResponse();

    loginUser(req, res);

    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();

    expect(statusMock).toHaveBeenCalledWith(200);
    expect(sendMock).toHaveBeenCalledWith({
      token: "login-token",
    });
  });

  test("loginUser returns 401 when bcrypt compare throws error", async () => {
    mockFindOne.mockResolvedValue({
      _id: "user1",
      username: "testuser",
      hashedPassword: "hashed-password",
    });

    bcryptMock.compare.mockRejectedValue(new Error("bcrypt error"));

    const req = {
      body: {
        username: "testuser",
        pwd: "password123",
      },
    };

    const res = mockResponse();

    loginUser(req, res);

    await new Promise((resolve) => setImmediate(resolve));

    expect(statusMock).toHaveBeenCalledWith(401);
    expect(sendMock).toHaveBeenCalledWith("Unauthorized");
  });

  test("authenticateUser returns 401 when token is missing", () => {
    const req = {
      headers: {},
    };

    const res = mockResponse();

    authenticateUser(req, res, nextMock);

    expect(statusMock).toHaveBeenCalledWith(401);
    expect(endMock).toHaveBeenCalled();
    expect(nextMock).not.toHaveBeenCalled();
  });

  test("authenticateUser calls next when token is valid", () => {
    const req = {
      headers: {
        authorization: "Bearer valid-token",
      },
    };

    const res = mockResponse();

    jwtMock.verify.mockImplementation((token, secret, callback) => {
      callback(null, {
        userId: "user1",
        username: "testuser",
      });
    });

    authenticateUser(req, res, nextMock);

    expect(req.user).toEqual({
      userId: "user1",
      username: "testuser",
    });
    expect(nextMock).toHaveBeenCalled();
  });

  test("authenticateUser returns 401 when token is invalid", () => {
    const req = {
      headers: {
        authorization: "Bearer invalid-token",
      },
    };

    const res = mockResponse();

    jwtMock.verify.mockImplementation((token, secret, callback) => {
      callback(new Error("invalid token"), null);
    });

    authenticateUser(req, res, nextMock);

    expect(statusMock).toHaveBeenCalledWith(401);
    expect(endMock).toHaveBeenCalled();
  });

  test("loginUser handles jwt sign error", async () => {
    mockFindOne.mockResolvedValue({
      _id: "user1",
      username: "testuser",
      hashedPassword: "hashed-password",
    });

    bcryptMock.compare.mockResolvedValue(true);
    jwtMock.sign.mockImplementation((payload, secret, options, callback) => {
      callback(new Error("jwt error"), null);
    });

    const req = {
      body: {
        username: "testuser",
        pwd: "password123",
      },
    };

    const res = mockResponse();

    loginUser(req, res);

    await new Promise((resolve) => setImmediate(resolve));

    expect(jwtMock.sign).toHaveBeenCalled();
    expect(statusMock).toHaveBeenCalledWith(401);
    expect(sendMock).toHaveBeenCalledWith("Unauthorized");
  });
});
