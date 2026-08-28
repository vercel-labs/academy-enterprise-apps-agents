export type DataType = "none" | "internal" | "confidential" | "restricted";

export type VendorRequestInput = {
  vendorName: string;
  businessPurpose: string;
  annualCost: number;
  dataTypes: DataType[];
};

export type PrototypeAssessment = {
  text: string;
};
