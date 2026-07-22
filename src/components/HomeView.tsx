import React from 'react';
import { CarListing, Dealer } from '../types';
import { HomeFeed } from './HomeFeed';

interface HomeViewProps {
  dealers: Dealer[];
  listings: CarListing[];
  onSelectDealer: (id: string) => void;
  setTab: (tab: string) => void;
  currentUser?: any;
  lang: 'en' | 'ur';
  onSelectListing: (car: CarListing) => void;
  onToggleCompare: (car: CarListing) => void;
  compareList: CarListing[];
  onToggleFavorite: (car: CarListing) => void;
  favoritesList: CarListing[];
  dbLoading?: boolean;
  setSelectedCategory?: (category: string) => void;
  setSearchQuery?: (query: string) => void;
}

export default function HomeView(props: HomeViewProps) {
  return (
    <HomeFeed
      listings={props.listings}
      dealers={props.dealers}
      onSelectListing={props.onSelectListing}
      onToggleCompare={props.onToggleCompare}
      compareList={props.compareList}
      onToggleFavorite={props.onToggleFavorite}
      favoritesList={props.favoritesList}
      lang={props.lang}
      setTab={props.setTab}
      setSelectedCategory={props.setSelectedCategory}
      setSearchQuery={props.setSearchQuery}
    />
  );
}
