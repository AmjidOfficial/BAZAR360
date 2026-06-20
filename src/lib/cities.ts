export interface ProvinceGroup {
  province: string;
  cities: string[];
}

export const PAKISTAN_CITIES_MATRIX: ProvinceGroup[] = [
  { province: 'Federal Capital', cities: ['Islamabad'] },
  {
    province: 'Punjab',
    cities: [
      'Lahore', 'Faisalabad', 'Rawalpindi', 'Multan', 'Gujranwala',
      'Sialkot', 'Bahawalpur', 'Sargodha', 'Sahiwal', 'Sheikhupura',
      'Jhelum', 'Gujrat'
    ]
  },
  {
    province: 'Sindh',
    cities: [
      'Karachi', 'Hyderabad', 'Sukkur', 'Larkana', 'Nawabshah', 'Mirpurkhas'
    ]
  },
  {
    province: 'Khyber Pakhtunkhwa',
    cities: [
      'Peshawar', 'Mardan', 'Abbottabad', 'Swat', 'Kohat', 'Bannu',
      'Dera Ismail Khan'
    ]
  },
  {
    province: 'Balochistan',
    cities: [
      'Quetta', 'Gwadar', 'Turbat', 'Khuzdar', 'Sibi'
    ]
  },
  {
    province: 'Azad Kashmir & Gilgit-Baltistan',
    cities: [
      'Muzaffarabad', 'Mirpur', 'Gilgit', 'Skardu'
    ]
  }
];

export const ALL_PAKISTAN_CITIES = [
  'All',
  'Islamabad',
  'Lahore', 'Faisalabad', 'Rawalpindi', 'Multan', 'Gujranwala', 'Sialkot', 'Bahawalpur', 'Sargodha', 'Sahiwal', 'Sheikhupura', 'Jhelum', 'Gujrat',
  'Karachi', 'Hyderabad', 'Sukkur', 'Larkana', 'Nawabshah', 'Mirpurkhas',
  'Peshawar', 'Mardan', 'Abbottabad', 'Swat', 'Kohat', 'Bannu', 'Dera Ismail Khan',
  'Quetta', 'Gwadar', 'Turbat', 'Khuzdar', 'Sibi',
  'Muzaffarabad', 'Mirpur', 'Gilgit', 'Skardu'
];
