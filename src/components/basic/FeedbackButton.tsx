// NextJS
import { useState } from "react";

// HeroUI
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure, Link } from "@heroui/react";
import { Textarea } from "@heroui/react";
import { addToast } from "@heroui/react";

// Posthog
import posthog from "posthog-js";

// Icons
import { BiMessageSquareDots } from "react-icons/bi";
  
export default function FeedbackButton() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");

  const handleSubmit = () => {
    if (rating) {
      posthog.capture("feedback", {
        rating,
        comment
      });
      // Reset form
      setRating(null);
      setComment("");

      addToast({
        title: "Feedback Sent Successfully!",
        description: "Thank you for helping us improve!",
        color: "default"
      });

      onOpenChange();
    }
  };

  return (
    <>
      <Button 
        onPress={onOpen}
        className={`px-2 bg-transparent w-full justify-start`}
        size={"lg"}
        startContent={<BiMessageSquareDots className="w-5 h-5" />}
      >
        Feedback
    </Button>
      <Modal 
        isOpen={isOpen} 
        onOpenChange={onOpenChange}
        size={"2xl"}
    >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Your Feedback</ModalHeader>
              <ModalBody>
                <div className="flex flex-col space-y-6 gap-4">
                  <div>
                    <p className="mb-2">How would you rate your experience?</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {[
                        { value: 1, label: "Really Bad" },
                        { value: 2, label: "Bad" },
                        { value: 3, label: "Neutral" },
                        { value: 4, label: "Good" },
                        { value: 5, label: "Fantastic!" }
                      ].map(({ value, label }) => (
                        <Button
                          key={value}
                          onPress={() => setRating(value)}
                          size={"md"}
                          radius={"full"}
                          className={`md:px-8 gap-1 py-2 ${
                            rating === value 
                              ? "border border-default-800 bg-default-900 text-default-100" 
                              : "border border-default-200 bg-transparent opacity-90 text-default-800"
                          }`}
                        >
                            <span className="text-xs">{label}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <Textarea
                      placeholder="Share your thoughts..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      minRows={3}
                    />
                  </div>
                </div>
              </ModalBody>
              <ModalFooter className={"flex items-center align-center justify-between"}>
                <Button
                    as={Link}
                    href={"https://www.linkedin.com/in/antonio-scapellato/"}
                    isExternal
                    showAnchorIcon
                    size={"md"}
                    className={"bg-transparent text-default-500 px-2"}
                >
                  Support
                </Button>
                <Button 
                  onPress={() => {handleSubmit()}}
                  isDisabled={!rating}
                  className={rating ? "bg-default-900 text-default-100" : "bg-default-100"}
                >
                  Send Feedback
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
