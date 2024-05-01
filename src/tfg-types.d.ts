export type Ticket = {
  ticket: {
    addr: string;
    electionId: number;
  };
  signature: string;
  padding: string;
};
