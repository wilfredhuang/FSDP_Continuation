/* --------------------------------------------------------------------------
 *  Custom Type Declarations for paynow-generator
 *  Ensures proper IntelliSense + removes TS7016 error
 * -------------------------------------------------------------------------- */

declare module "paynow-generator" {
  /**
   * Options for generating a PayNow QR code.
   */
  interface PayNowOptions {
    /** Amount to be paid (in SGD). */
    amount: number;

    /** Reference string shown to payer (e.g., invoice ID). */
    reference: string;

    /** Optional company name (for display). */
    company?: string;

    /** Whether payer can edit the amount in PayNow app. */
    editable?: boolean;

    /** UEN or PayNow identifier. */
    uen?: string;

    /** Expiry date/time string (ISO or formatted). */
    expiry?: string;

    /** Currency code, defaults to "SGD". */
    currency?: string;
  }

  /**
   * Resulting QR data returned by the library.
   */
  interface PayNowResponse {
    /** The raw PayNow QR payload string. */
    qrString: string;

    /** Optional SVG markup for displaying the QR. */
    svg?: string;

    /** Optional Base64-encoded string version. */
    base64?: string;
  }

  /**
   * Main generator function.
   * @example
   * ```ts
   * import paynow from "paynow-generator";
   * const qr = paynow({ amount: 12.5, reference: "ORDER123" });
   * console.log(qr.qrString);
   * ```
   */
  function paynow(options: PayNowOptions): PayNowResponse;

  export = paynow;
}
