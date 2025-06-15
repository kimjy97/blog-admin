'use client'

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import useSearchIPModalStore from "@/store/searchIPModalStore";
import { useEffect, useState } from "react";
import dynamic from 'next/dynamic';
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { MapPinIcon } from "@heroicons/react/24/solid";

const DynamicIPLocationMap = dynamic(
  () => import("./IPLocationMap"),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center w-full h-full">
        <LoadingSpinner />
      </div>
    ),
  }
);

const SearchIPModal = () => {
  const { isSearchIPModalOpen, searchIP, setIsSearchIPModalOpen, setSearchIP } = useSearchIPModalStore();
  const [isKorean, setIsKorean] = useState(false);
  const [location, setLocation] = useState<any>(null);
  const vworldKey = process.env.NEXT_PUBLIC_VWORLD_API_KEY;
  const label = `${location?.city}, ${location?.country_name}`;

  const handleOpenChange = (show: boolean) => {
    if (!show) {
      setSearchIP(undefined);
      setLocation(null);
    }
    setIsSearchIPModalOpen(show);
  }

  useEffect(() => {
    if (isSearchIPModalOpen) {
      fetch(`https://ipapi.co/${searchIP}/json/?lang=ko`)
        .then(res => res.json())
        .then((loc) => {
          setLocation(loc);
          if (loc.country_code === 'KR' || loc.country_name === '대한민국') {
            setIsKorean(true);
          }
        })
        .catch(console.error);
    }
  }, [isSearchIPModalOpen]);

  return (
    <Dialog open={isSearchIPModalOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[26.5625rem] md:max-w-[37.5rem] lg:max-w-[50rem] max-h-[90vh]">
        <DialogTitle className="flex items-center">
          <MapPinIcon className="w-5 h-5 mr-1 inline" />{searchIP}
        </DialogTitle>
        <div className="relative w-full mt-2 h-[70vh] rounded-lg overflow-hidden">
          {location && (
            <DynamicIPLocationMap
              location={location}
              label={label}
              isKorean={isKorean}
              vworldKey={vworldKey}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default SearchIPModal;
