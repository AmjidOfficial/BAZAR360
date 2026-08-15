import React, { useState, useEffect } from 'react';
import { UserProfile, dbFetchUserConversations, dbFetchNotifications } from '../lib/dbService';
import { CarListing } from '../types';
import { useAuth } from './AuthContext';
import { ProfileHeader } from './profile/ProfileHeader';
import { AccountNavigation, ProfileTab } from './profile/AccountNavigation';
import { ProfileOverview } from './profile/ProfileOverview';
import { MyVehicles } from './profile/MyVehicles';
import { Favorites } from './profile/Favorites';
import { SavedSearches } from './profile/SavedSearches';
import { RecentlyViewed } from './profile/RecentlyViewed';
import { MessagesPreview } from './profile/MessagesPreview';
import { NotificationsPreview } from './profile/NotificationsPreview';
import { ActivityTimeline } from './profile/ActivityTimeline';
import { SecurityCenter } from './profile/SecurityCenter';
import { PrivacySettings } from './profile/PrivacySettings';
import { RoleTailoredSettings } from './RoleTailoredSettings';
import { dbFetchUserSavedSearches } from '../lib/userProfileService';

export interface UserProfileViewProps {
  user: UserProfile;
  lang: 'en' | 'ur';
  listings?: CarListing[];
  favoritesList?: CarListing[];
  onSelectListing?: (car: CarListing) => void;
  onToggleFavorite?: (car: CarListing) => void;
  onUpdateUser?: (updated: UserProfile) => void;
  onDeleteListing?: (listingId: string) => void;
  setTab?: (tab: string) => void;
  onOpenConversation?: (convId: string) => void;
  
  // Extra props for compatibility with App.tsx
  dealers?: any[];
  onApproveListing?: (id: string) => void;
  onRejectListing?: (id: string) => void;
  onPostCreated?: (newCar: CarListing) => void;
}

export default function UserProfileView({
  user,
  lang,
  listings = [],
  favoritesList = [],
  onSelectListing,
  onToggleFavorite,
  onUpdateUser,
  onDeleteListing,
  setTab,
  onOpenConversation
}: UserProfileViewProps) {
  const { logout, recentViews } = useAuth();
  const [activeTab, setActiveTab] = useState<ProfileTab>('overview');

  // Network State
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Listen to subtab event triggers from external components/mobile drawer
  useEffect(() => {
    const handleSubtabEvent = (e: any) => {
      if (e.detail && ['overview', 'my_vehicles', 'favorites', 'saved_searches', 'recently_viewed', 'messages', 'notifications', 'activity', 'security', 'privacy'].includes(e.detail)) {
        setActiveTab(e.detail as ProfileTab);
      }
    };
    window.addEventListener('set-profile-subtab', handleSubtabEvent);
    return () => window.removeEventListener('set-profile-subtab', handleSubtabEvent);
  }, []);

  // Real Counts calculation
  const userPostedVehicles = listings.filter((car) => {
    if (car.createdBy === user.uid) return true;
    if ((car as any).ownerId === user.uid) return true;
    if (user.phoneNumber && (car.sellerPhone === user.phoneNumber || car.phone === user.phoneNumber)) return true;
    return false;
  });

  const [savedSearchCount, setSavedSearchCount] = useState(0);
  const [unreadMsgCount, setUnreadMsgCount] = useState(0);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);

  useEffect(() => {
    if (user && user.uid) {
      dbFetchUserSavedSearches(user.uid).then(res => setSavedSearchCount(res.length));
      dbFetchUserConversations(user.uid).then(convs => {
        let unread = 0;
        convs.forEach(c => {
          if (c.unreadCount && c.unreadCount[user.uid]) {
            unread += c.unreadCount[user.uid];
          }
        });
        setUnreadMsgCount(unread);
      });
      dbFetchNotifications(user.uid).then(notifs => {
        setUnreadNotifCount(notifs.filter(n => !n.read).length);
      });
    }
  }, [user]);

  const counts = {
    vehicles: userPostedVehicles.length,
    favorites: favoritesList.length,
    savedSearches: savedSearchCount,
    recentViews: recentViews.length,
    unreadMessages: unreadMsgCount,
    unreadNotifications: unreadNotifCount
  };

  const handlePostVehicleClick = () => {
    if (setTab) setTab('sell');
    else window.dispatchEvent(new CustomEvent('change-tab', { detail: 'sell' }));
  };

  const handleBrowseMarketplaceClick = () => {
    if (setTab) setTab('search');
    else window.dispatchEvent(new CustomEvent('change-tab', { detail: 'search' }));
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] py-6 sm:py-8 px-3 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header Card */}
        <ProfileHeader
          user={user}
          onEditProfile={() => setActiveTab('overview')}
          onOpenSecurity={() => setActiveTab('security')}
          onUpdateUser={onUpdateUser}
          setTab={setTab}
        />

        {/* Main Two-Column Desktop / Responsive Mobile Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* Navigation Sidebar / Horizontal Pills */}
          <div className="lg:col-span-1">
            <AccountNavigation
              activeTab={activeTab}
              onSelectTab={setActiveTab}
              counts={counts}
            />
          </div>

          {/* Active Tab Main Content Panel */}
          <div className="lg:col-span-3 min-w-0">
            {activeTab === 'overview' && (
              <ProfileOverview
                user={user}
                onUpdateUser={onUpdateUser}
                counts={counts}
                onNavigateTab={setActiveTab}
              />
            )}

            {activeTab === 'my_vehicles' && (
              <MyVehicles
                user={user}
                listings={listings}
                onSelectListing={onSelectListing}
                onDeleteListing={onDeleteListing}
                onPostVehicleClick={handlePostVehicleClick}
              />
            )}

            {activeTab === 'favorites' && (
              <Favorites
                favoritesList={favoritesList}
                onSelectListing={onSelectListing}
                onToggleFavorite={onToggleFavorite}
                onExploreVehicles={handleBrowseMarketplaceClick}
              />
            )}

            {activeTab === 'saved_searches' && (
              <SavedSearches
                user={user}
                onRunSearch={() => handleBrowseMarketplaceClick()}
              />
            )}

            {activeTab === 'recently_viewed' && (
              <RecentlyViewed
                recentViews={recentViews}
                onSelectListing={onSelectListing}
                onBrowseMarketplace={handleBrowseMarketplaceClick}
              />
            )}

            {activeTab === 'messages' && (
              <MessagesPreview
                user={user}
                onOpenConversation={onOpenConversation}
                onBrowseVehicles={handleBrowseMarketplaceClick}
              />
            )}

            {activeTab === 'notifications' && (
              <NotificationsPreview user={user} />
            )}

            {activeTab === 'activity' && (
              <ActivityTimeline user={user} />
            )}

            {activeTab === 'security' && (
              <SecurityCenter
                user={user}
                onLogout={logout}
                onUpdateUser={onUpdateUser}
              />
            )}

            {activeTab === 'privacy' && (
              <div className="space-y-8">
                <RoleTailoredSettings
                  currentUser={user}
                  lang={lang}
                  onUpdateUser={onUpdateUser}
                />
                <PrivacySettings
                  user={user}
                  onUpdateUser={onUpdateUser}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
