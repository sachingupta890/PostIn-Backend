

class ErrorHandler extends Error {
  constructor(
    public message: string = "Internal Server Error",
    public statusCode: number = 500
  ) {
    super(message);
    this.statusCode = statusCode;
  }
}

export default ErrorHandler;