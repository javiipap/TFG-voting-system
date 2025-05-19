export type Ticket = {
  ticket: {
    addr: string;
    electionId: number;
    iatOffset: number;
  };
  signature: string;
};
