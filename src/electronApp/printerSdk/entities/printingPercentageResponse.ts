import { IPrinterResponse } from "./iPrinterResponse";

export class PrintingPercentageResponse implements IPrinterResponse {
  /**
   * Gets the print percentage
   */
  public Percentage: number;

  /**
   * Initializes a new instance of the PrintingPercentageResponse class.
   */
  constructor(responses: Array<string>) {
    // Example interaction:
    // /
    // CMD M27 Received.
    // SD printing byte 72/100
    // ok

    responses.forEach((response) => {
      if (response.startsWith("SD printing byte")) {
        const parts = response.split(" ");
        const percentageParts = parts[3].split("/");
        this.Percentage = Number.parseFloat(percentageParts[0]);
      }
    });
  }
}
