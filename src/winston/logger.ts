import winston from "winston";

const { timestamp, combine, printf, colorize, errors } = winston.format;

const myFormat = printf(({ timestamp, level, message, stack }) => {
  return stack
    ? `${timestamp} : ${level} : ${message} - ${stack}`
    : `${timestamp} : ${level} : ${message}`;
});

export const logger = winston.createLogger({
  level: "info",
  format: combine(
    errors({ stack: true }),
    colorize(),
    timestamp(), 
    myFormat 
  ),
  transports: [
    new winston.transports.Console(), 
    new winston.transports.File({ filename: "app.log" }), 
  ],
});
