import React from 'react';

// HeroUI
import { Modal, ModalContent, Button, Image } from '@heroui/react';

// Icons
import { IoCloseOutline, IoDownloadOutline, IoOpenOutline, IoExpandOutline } from 'react-icons/io5';

interface ChatImageVisualizerProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  imageUrl: string;
  imageDescription?: string;
}

export const ChatImageVisualizer: React.FC<ChatImageVisualizerProps> = ({
  isOpen,
  onOpenChange,
  imageUrl,
  imageDescription
}) => {
  const handleDownload = () => {
    // Use our API endpoint to handle the download
    const downloadUrl = `/api/utils/download-image?url=${encodeURIComponent(imageUrl)}`;
    
    // Open the download in a new tab/window
    // This approach works better across browsers and avoids CORS issues
    window.open(downloadUrl, '_blank');
  };

  const handleOpenExternal = () => {
    window.open(imageUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Modal 
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="full"
      classNames={{
        base: "bg-black/90 backdrop-blur-md",
        wrapper: "w-full h-full p-0",
        body: "p-0",
        backdrop: "bg-black/90 backdrop-blur-md"
      }}
      hideCloseButton={true}
      motionProps={{
        variants: {
          enter: {
            opacity: 1,
            transition: {
              duration: 0.3,
              ease: "easeOut"
            }
          },
          exit: {
            opacity: 0,
            transition: {
              duration: 0.2,
              ease: "easeIn"
            }
          }
        }
      }}
    >
      <ModalContent>
        {(onClose) => (
          <div className="fixed inset-0 w-screen h-screen flex flex-col items-center justify-center overflow-hidden">
            {/* Controls overlay - top */}
            <div className="absolute top-0 left-0 right-0 z-50 flex justify-end p-4 bg-gradient-to-b from-black/60 to-transparent">
              <Button
                isIconOnly
                variant="flat"
                color="default"
                aria-label="Close"
                className="bg-black/40 text-white hover:bg-black/60 rounded-full"
                onPress={onClose}
              >
                <IoCloseOutline size={24} />
              </Button>
            </div>
            
            {/* Image container - center */}
            <div className="w-full h-full flex items-center justify-center p-4">
              <div className="relative max-w-full max-h-full overflow-hidden">
                <Image
                  src={imageUrl}
                  alt={imageDescription || 'Fullscreen image'}
                  className="max-w-full max-h-[65vh] object-contain rounded-lg shadow-2xl"
                  radius="lg"
                />
              </div>
            </div>
            
            {/* Controls overlay - bottom */}
            <div className="absolute bottom-0 left-0 right-0 z-50 flex justify-center p-6 bg-gradient-to-t from-black/60 to-transparent">
              {/* Description (if available) */}
              {imageDescription && (
                <div className="absolute bottom-24 bg-black/60 text-white p-3 rounded-lg max-w-[80%] text-center mb-4">
                  <p className="text-sm md:text-base">{imageDescription}</p>
                </div>
              )}
              
              {/* Action buttons */}
              <div className="flex gap-4">
                <Button
                  variant="flat"
                  color="primary"
                  startContent={<IoDownloadOutline size={20} />}
                  onPress={handleDownload}
                  className="border border-default-900 bg-black/50 text-white hover:bg-black/70 rounded-full"
                >
                  Download
                </Button>
                <Button
                  variant="flat"
                  color="primary"
                  startContent={<IoOpenOutline size={20} />}
                  onPress={handleOpenExternal}
                  className="border border-default-900 bg-black/50 text-white hover:bg-black/70 rounded-full"
                >
                  Open Original
                </Button>
              </div>
            </div>
          </div>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ChatImageVisualizer;