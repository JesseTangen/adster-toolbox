export type LocalBusinessType = {
  value: string;
  category: string;
  deprecated?: boolean;
};

type TypeGroup = {
  category: string;
  types: Array<{ value: string; deprecated?: boolean }>;
};

/**
 * Every current LocalBusiness descendant in the official Schema.org hierarchy,
 * organized for fast visual scanning in the picker.
 */
export const localBusinessTypeGroups: TypeGroup[] = [
  {
    category: "All local businesses",
    types: [
      { value: "LocalBusiness" }, { value: "AnimalShelter" }, { value: "ArchiveOrganization" },
      { value: "ChildCare" }, { value: "DryCleaningOrLaundry" }, { value: "EmploymentAgency" },
      { value: "InternetCafe" }, { value: "Library" }, { value: "RadioStation" },
      { value: "RealEstateAgent" }, { value: "RecyclingCenter" }, { value: "SelfStorage" },
      { value: "ShoppingCenter" }, { value: "TelevisionStation" }, { value: "TouristInformationCenter" },
      { value: "TravelAgency" },
    ],
  },
  {
    category: "Automotive",
    types: [
      { value: "AutomotiveBusiness" }, { value: "AutoBodyShop" }, { value: "AutoDealer" },
      { value: "AutoPartsStore" }, { value: "AutoRental" }, { value: "AutoRepair" },
      { value: "AutoWash" }, { value: "GasStation" }, { value: "MotorcycleDealer" },
      { value: "MotorcycleRepair" },
    ],
  },
  {
    category: "Emergency & government",
    types: [
      { value: "EmergencyService" }, { value: "FireStation" }, { value: "Hospital" },
      { value: "PoliceStation" }, { value: "GovernmentOffice" }, { value: "PostOffice" },
    ],
  },
  {
    category: "Entertainment & culture",
    types: [
      { value: "EntertainmentBusiness" }, { value: "AdultEntertainment" }, { value: "AmusementPark" },
      { value: "ArtGallery" }, { value: "Casino" }, { value: "ComedyClub" }, { value: "MovieTheater" },
      { value: "NightClub" },
    ],
  },
  {
    category: "Financial services",
    types: [
      { value: "FinancialService" }, { value: "AccountingService" }, { value: "AutomatedTeller" },
      { value: "BankOrCreditUnion" }, { value: "InsuranceAgency" },
    ],
  },
  {
    category: "Food & drink",
    types: [
      { value: "FoodEstablishment" }, { value: "Bakery" }, { value: "BarOrPub" }, { value: "Brewery" },
      { value: "CafeOrCoffeeShop" }, { value: "Distillery" }, { value: "FastFoodRestaurant" },
      { value: "IceCreamShop" }, { value: "Restaurant" }, { value: "Winery" },
    ],
  },
  {
    category: "Health, beauty & medical",
    types: [
      { value: "HealthAndBeautyBusiness" }, { value: "BeautySalon" }, { value: "DaySpa" },
      { value: "HairSalon" }, { value: "HealthClub" }, { value: "NailSalon" }, { value: "TattooParlor" },
      { value: "MedicalBusiness" }, { value: "Dentist" }, { value: "MedicalClinic" },
      { value: "CovidTestingFacility" }, { value: "Optician" }, { value: "Pharmacy" },
      { value: "Physician" }, { value: "IndividualPhysician" }, { value: "PhysiciansOffice" },
    ],
  },
  {
    category: "Home & construction",
    types: [
      { value: "HomeAndConstructionBusiness" }, { value: "Electrician" }, { value: "GeneralContractor" },
      { value: "HVACBusiness" }, { value: "HousePainter" }, { value: "Locksmith" },
      { value: "MovingCompany" }, { value: "Plumber" }, { value: "RoofingContractor" },
    ],
  },
  {
    category: "Legal & professional",
    types: [
      { value: "LegalService" }, { value: "Attorney", deprecated: true }, { value: "Notary" },
      { value: "ProfessionalService", deprecated: true },
    ],
  },
  {
    category: "Lodging",
    types: [
      { value: "LodgingBusiness" }, { value: "BedAndBreakfast" }, { value: "Campground" },
      { value: "Hostel" }, { value: "Hotel" }, { value: "Motel" }, { value: "Resort" },
      { value: "SkiResort" }, { value: "VacationRental" },
    ],
  },
  {
    category: "Sport & recreation",
    types: [
      { value: "SportsActivityLocation" }, { value: "BowlingAlley" }, { value: "ExerciseGym" },
      { value: "GolfCourse" }, { value: "PublicSwimmingPool" }, { value: "SportsClub" },
      { value: "StadiumOrArena" }, { value: "TennisComplex" },
    ],
  },
  {
    category: "Retail",
    types: [
      { value: "Store" }, { value: "BikeStore" }, { value: "BookStore" }, { value: "ClothingStore" },
      { value: "ComputerStore" }, { value: "ConvenienceStore" }, { value: "DepartmentStore" },
      { value: "ElectronicsStore" }, { value: "Florist" }, { value: "FurnitureStore" },
      { value: "GardenStore" }, { value: "GroceryStore" }, { value: "HardwareStore" },
      { value: "HobbyShop" }, { value: "HomeGoodsStore" }, { value: "JewelryStore" },
      { value: "LiquorStore" }, { value: "MensClothingStore" }, { value: "MobilePhoneStore" },
      { value: "MovieRentalStore" }, { value: "MusicStore" }, { value: "OfficeEquipmentStore" },
      { value: "OutletStore" }, { value: "PawnShop" }, { value: "PetStore" }, { value: "ShoeStore" },
      { value: "SportingGoodsStore" }, { value: "TireShop" }, { value: "ToyStore" },
      { value: "WholesaleStore" },
    ],
  },
];

export const localBusinessTypes: LocalBusinessType[] = localBusinessTypeGroups.flatMap(group =>
  group.types.map(type => ({ ...type, category: group.category })),
);

export function findLocalBusinessType(value: string) {
  return localBusinessTypes.find(type => type.value === value);
}

const descendantsByAncestor: Record<string, string[]> = {
  FoodEstablishment: ["Bakery", "BarOrPub", "Brewery", "CafeOrCoffeeShop", "Distillery", "FastFoodRestaurant", "IceCreamShop", "Restaurant", "Winery"],
  MedicalBusiness: ["Dentist", "MedicalClinic", "CovidTestingFacility", "Optician", "Pharmacy", "Physician", "IndividualPhysician", "PhysiciansOffice"],
  LegalService: ["Attorney", "Notary"],
  Store: ["BikeStore", "BookStore", "ClothingStore", "ComputerStore", "ConvenienceStore", "DepartmentStore", "ElectronicsStore", "Florist", "FurnitureStore", "GardenStore", "GroceryStore", "HardwareStore", "HobbyShop", "HomeGoodsStore", "JewelryStore", "LiquorStore", "MensClothingStore", "MobilePhoneStore", "MovieRentalStore", "MusicStore", "OfficeEquipmentStore", "OutletStore", "PawnShop", "PetStore", "ShoeStore", "SportingGoodsStore", "TireShop", "ToyStore", "WholesaleStore"],
};

export function isLocalBusinessType(value: string, ancestor: string) {
  return value === ancestor || descendantsByAncestor[ancestor]?.includes(value) || false;
}
