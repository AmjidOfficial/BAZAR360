export const PAKISTAN_CITIES = [
  'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Peshawar', 'Quetta', 'Multan', 'Faisalabad', 'Sialkot', 'Gujranwala', 
  'Hyderabad', 'Abbottabad', 'Bahawalpur', 'Sukkur', 'Mardan', 'Swat', 'Sargodha', 'Gujrat', 'Sheikhupura', 'Jhang', 
  'Rahim Yar Khan', 'Kasur', 'Dera Ghazi Khan', 'Nawabshah', 'Sahiwal', 'Mirpur Khas', 'Okara', 'Kohat', 'Chiniot', 
  'Jacobabad', 'Muzaffargarh', 'Khanewal', 'Khuzdar', 'Dera Ismail Khan', 'Nowshera', 'Charsadda', 'Swabi', 'Mianwali',
  'Attock', 'Jhelum', 'Vehari', 'Gojra', 'Daska', 'Burewala', 'Hafizabad', 'Kamoke', 'Muridke', 'Bhalwal', 'Chishtian'
].sort();

export const PAKISTAN_BRANDS = [
  'Toyota', 'Honda', 'Suzuki', 'KIA', 'Hyundai', 'Changan', 'MG', 'Haval', 'Peugeot', 'DFSK', 'FAW', 'Prince', 'BAIC', 
  'Proton', 'Chery', 'Mercedes-Benz', 'BMW', 'Audi', 'Porsche', 'Lexus', 'Land Rover', 'Range Rover', 'Jaguar', 'Jeep', 
  'Nissan', 'Mitsubishi', 'Daihatsu', 'Mazda', 'Subaru', 'Ford', 'Chevrolet', 'JAC', 'Isuzu', 'Hino', 'Seres', 'Oshan', 'GWM'
].sort();

export const CAR_MODELS: Record<string, string[]> = {
  'Toyota': ['Corolla', 'Yaris', 'Prius', 'Camry', 'Aqua', 'Vitz', 'Passo', 'Prado', 'Land Cruiser', 'Fortuner', 'Hilux', 'Revo', 'Crown', 'C-HR', 'Raize', 'Rush', 'Mark X', 'Surf', 'Hiace', 'Sienta'],
  'Honda': ['Civic', 'City', 'Accord', 'BR-V', 'HR-V', 'CR-V', 'Vezel', 'Fit', 'Freed', 'N-Wgn', 'N-One', 'Crossroad', 'Grace', 'Insight'],
  'Suzuki': ['Alto', 'Cultus', 'Swift', 'Wagon R', 'Bolan', 'Ravi', 'Mehran', 'Khyber', 'Margalla', 'Baleno', 'Liana', 'Every', 'Jimny', 'Vitara', 'APV', 'Hustler', 'Spacia'],
  'KIA': ['Sportage', 'Picanto', 'Stonic', 'Sorento', 'Carnival', 'Rio', 'Cerato'],
  'Hyundai': ['Tucson', 'Elantra', 'Sonata', 'Santa Fe', 'Santro', 'Ioniq', 'Kona', 'Staria', 'Porter'],
  'Changan': ['Alsvin', 'Oshan X7', 'Karvaan', 'M9', 'Lumin'],
  'MG': ['HS', 'ZS', 'ZS EV', 'MG 4', 'MG 5', 'MG 3', 'Gloster'],
  'Haval': ['H6', 'Jolion', 'H6 HEV'],
  'Peugeot': ['2008', '3008', '5008'],
  'Proton': ['Saga', 'X70', 'X50'],
  'Chery': ['Tiggo 4 Pro', 'Tiggo 8 Pro'],
  'Nissan': ['Dayz', 'Note', 'Juke', 'Patrol', 'Sunny', 'March', 'Tiida', 'X-Trail', 'Navara', 'Leaf'],
  'Mitsubishi': ['Pajero', 'Lancer', 'Mirage', 'Outlander', 'Galant', 'EK Wagon', 'Minica'],
  'Daihatsu': ['Mira', 'Move', 'Cast', 'Tanto', 'Boon', 'Hijet', 'Terios', 'Charade', 'Cuore'],
  'Mazda': ['Carol', 'Scrum', 'Flair', 'CX-3', 'CX-5', 'Axela', 'Demio', 'RX-8'],
  'Mercedes-Benz': ['C-Class', 'E-Class', 'S-Class', 'G-Class', 'GLA', 'GLC', 'GLE', 'GLS', 'A-Class'],
  'BMW': ['3 Series', '5 Series', '7 Series', 'X1', 'X3', 'X5', 'X7', 'i3', 'i8'],
  'Audi': ['A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'Q2', 'Q3', 'Q5', 'Q7', 'Q8', 'e-tron'],
  'Porsche': ['Panamera', 'Cayenne', 'Macan', 'Taycan', '911'],
  'Lexus': ['CT200h', 'RX', 'LX', 'NX', 'ES', 'IS', 'GS'],
  'Land Rover': ['Range Rover', 'Defender', 'Discovery', 'Evoque', 'Velar'],
  'Jeep': ['Wrangler', 'Grand Cherokee', 'Cherokee', 'Renegade'],
  'Ford': ['Ranger', 'Mustang', 'F-150', 'Explorer', 'Focus'],
  'Chevrolet': ['Joy', 'Exclusive', 'Cruze', 'Optra', 'Spark'],
  'Isuzu': ['D-Max', 'Mu-X'],
  'Prince': ['Pearl'],
  'DFSK': ['Glory 580', 'Glory 580 Pro', 'K01S', 'C37'],
  'BAIC': ['BJ40 Plus', 'Senova X25', 'D20'],
  'FAW': ['V2', 'X-PV', 'Carrier']
};

export const BIKE_BRANDS = [
  'Honda', 'Yamaha', 'Suzuki', 'Super Power', 'Road Prince', 'United', 'Unique', 'Hi-Speed', 'Crown', 'Kawasaki', 'BMW Motorrad', 'Vespa'
].sort();

export const BIKE_MODELS: Record<string, string[]> = {
  'Honda': ['CG 125', 'CD 70', 'CB 150F', 'CD 70 Dream', 'CB 125F', 'Pridor 100', 'CBR 150R', 'CB 250R'],
  'Yamaha': ['YBR 125G', 'YBR 125', 'YB 125Z', 'YB 125Z-DX', 'R1', 'R6', 'MT-09'],
  'Suzuki': ['GD 110S', 'GS 150', 'GR 150', 'GSX-R150', 'Inazuma 250', 'Hayabusa', 'Sprinter'],
  'Super Power': ['SP 70', 'SP 125', 'Archi 150', 'Leo 200', 'Falcon 150'],
  'Road Prince': ['Passion 70', 'Bullet 110', 'Robinson 150', 'Wego 150', 'Twister 150'],
  'United': ['US 70', 'US 100', 'US 125', 'Alpha 100', 'US 150'],
  'Unique': ['UD 70', 'UD 100', 'UD 125', 'Crazer 150'],
  'Hi-Speed': ['Freedom 150', 'Infinity 150', 'Alpha 100'],
  'Crown': ['Fit 70', 'CR 100', 'CR 125'],
  'Kawasaki': ['Ninja 250', 'Ninja 400', 'Z400', 'ZX-10R'],
  'BMW Motorrad': ['S1000RR', 'R1250GS', 'G310R'],
  'Vespa': ['Primavera', 'Sprint', 'LX 150']
};

export const COMMERCIAL_BRANDS = [
  'Isuzu', 'Hino', 'Master', 'JAC', 'FAW', 'Hyundai', 'Toyota', 'Suzuki', 'Changan', 'Dongfeng', 'Shacman'
].sort();

export const COMMERCIAL_MODELS: Record<string, string[]> = {
  'Isuzu': ['N-Series', 'F-Series', 'D-Max', 'Forward', 'Giga'],
  'Hino': ['500 Series', '300 Series', 'Kazay', 'Dutro'],
  'Master': ['Fuso Canter', 'Super Great', 'Fighter'],
  'JAC': ['X200', 'Motors Truck', 'Heavy Duty'],
  'FAW': ['Tiger V', 'J5M', 'Carrier', 'X-PV'],
  'Hyundai': ['Shehzore', 'Porter', 'Mighty', 'Universe'],
  'Toyota': ['Hiace', 'Coaster', 'TownAce', 'LiteAce'],
  'Suzuki': ['Bolan', 'Ravi', 'APV'],
  'Changan': ['Karvaan', 'M9', 'Hunter']
};

export const VARIANTS_CATALOG: Record<string, string[]> = {
  // Cars
  'Corolla': ['XLi', 'GLi', 'Altis 1.6', 'Altis 1.8', 'Grande', 'SR', '1.6 Manual', '1.8 CVT-i'],
  'Yaris': ['GLI 1.3', 'ATIV 1.3', 'ATIV X 1.5', 'Aero 1.5'],
  'Fortuner': ['G 2.7', 'Sigma 4 2.8', 'Legender', 'GR-S'],
  'Hilux': ['Single Cabin', 'Double Cabin', 'Revo G', 'Revo V', 'Revo Rocco', 'GR Sport'],
  'Land Cruiser': ['ZX', 'VX', 'AX', 'TX', 'TX-L', 'Prado 2.7', 'Prado 4.0'],
  'Aqua': ['L', 'S', 'G', 'G LED', 'GR Sport'],
  'Vitz': ['F 1.0', 'U 1.3', 'Jewela', 'RS 1.5'],
  'Civic': ['VTi Oriel', 'RS Turbo', 'Exi', 'Prosmatec', 'Type R', 'Hardtop'],
  'City': ['i-VTEC 1.2', 'i-VTEC 1.5', 'Aspire 1.5', 'EX', 'Steermatic'],
  'Vezel': ['G', 'X', 'Z', 'RS Hybrid', 'Play'],
  'Alto': ['VX', 'VXR', 'VXL', 'AGS', 'Turbo RS', 'L', 'G'],
  'Cultus': ['VX', 'VXR', 'VXL', 'Euro II', 'AGS'],
  'Wagon R': ['VX', 'VXR', 'VXL', 'FX', 'FZ'],
  'Swift': ['DX', 'DLX', 'GL', 'GLX', 'GLX CVT'],
  'Mehran': ['VX', 'VXR', 'VX CNG', 'VXR CNG'],
  'Sportage': ['Alpha', 'FWD', 'AWD', 'Limited'],
  'Tucson': ['GLS', 'GLS Clean', 'Ultimate AWD', 'FWD'],
  'Alsvin': ['1.3L MT Comfort', '1.5L DCT Comfort', '1.5L DCT Lumiere'],
  'Oshan X7': ['Comfort 7-Seater', 'FutureSense 5-Seater'],
  'HS': ['1.5T Exclusive', 'PHEV', '2.0T AWD'],
  'H6': ['1.5T FWD', '2.0T AWD', 'HEV'],
  // Motorcycles
  'CG 125': ['Standard', 'Special Edition (SE)', 'Self Start', 'Gold Edition'],
  'CD 70': ['Standard', 'Dream', 'Special Edition'],
  'CB 150F': ['Standard', 'Special Edition'],
  'YBR 125G': ['ESD', 'Special Edition', 'Night Fluo', 'Standard'],
  'YBR 125': ['Standard', 'ESD'],
  'YB 125Z': ['Standard', 'DX (Disc Brake)'],
  'GD 110S': ['Standard', 'HU 110'],
  'GS 150': ['Standard', 'SE (Disc)'],
  'GR 150': ['Standard'],
  'Freedom 150': ['Standard', 'Sports Trim']
};

/**
 * Returns available Makes filtered by Vehicle Type
 */
export function getMakesForType(vehicleType: string): string[] {
  const normType = (vehicleType || 'car').toLowerCase();
  if (normType === 'motorcycle' || normType === 'bike') {
    return BIKE_BRANDS;
  }
  if (normType === 'commercial' || normType === 'truck' || normType === 'bus') {
    return COMMERCIAL_BRANDS;
  }
  return PAKISTAN_BRANDS;
}

/**
 * Returns available Models filtered by Vehicle Type + Make
 */
export function getModelsForMake(vehicleType: string, make: string): string[] {
  if (!make) return [];
  const normType = (vehicleType || 'car').toLowerCase();
  
  if (normType === 'motorcycle' || normType === 'bike') {
    if (BIKE_MODELS[make]) return BIKE_MODELS[make];
  } else if (normType === 'commercial' || normType === 'truck' || normType === 'bus') {
    if (COMMERCIAL_MODELS[make]) return COMMERCIAL_MODELS[make];
  }
  
  if (CAR_MODELS[make]) return CAR_MODELS[make];
  // Search fallback
  return CAR_MODELS[make] || BIKE_MODELS[make] || COMMERCIAL_MODELS[make] || [];
}

/**
 * Returns available Variants for a given Model
 */
export function getVariantsForModel(model: string): string[] {
  if (!model) return [];
  if (VARIANTS_CATALOG[model]) return VARIANTS_CATALOG[model];
  // Fuzzy or default fallback
  return VARIANTS_CATALOG[model] || ['Standard / Base', 'Executive', 'Special Edition'];
}

