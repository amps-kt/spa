import axios from "axios";

import {
  type MatchingOutput,
  type MatchingInput,
  type IReaderAllocator,
  matchingOutputSchema,
} from "./types";

export class HttpReaderAllocator implements IReaderAllocator {
  private server_url: string;

  public constructor(server_url: string) {
    this.server_url = server_url;
  }

  public async allocate(inputData: MatchingInput): Promise<MatchingOutput> {
    const result = await axios
      .post(`${this.server_url}/rpa`, inputData)
      .then((res) => matchingOutputSchema.safeParse(res.data));

    if (!result.success) {
      throw new Error("Matching server did not return a valid response");
    }

    return result.data;
  }
}
