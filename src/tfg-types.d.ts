export type Ticket = {
  ticket: {
    addr: string;
    electionId: number;
    iat: number;
  };
  signature: string;
};
