declare namespace Express {
  interface Request {
    user?: {
      _id: string; 
      fullName: string; 
      email: string;
    };
  }
}