export interface PackedColumnRedistributorInput {
  packedBedHeight: number
  columnDiameter: number
  maximumSectionHeight: number
}

export interface PackedColumnRedistributorResult {
  modelName: string
  limitationDescription: string
  columnArea: number
  totalPackingVolume: number
  requiredBedSections: number
  requiredRedistributorCount: number
  actualSectionHeight: number
  sectionPackingVolume: number
  redistributorElevations: number[]
  sectionHeightUtilization: number
}
