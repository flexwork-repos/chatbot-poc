import React, { useState, useEffect } from "react";
import { useSpring, animated, config } from "react-spring";
import ChatMessages from "../ChatMessages/ChatMessages";
import ChatInput from "../ChatInput/ChatInput";
import ChatOptions from "../ChatOptions/ChatOptions";
import MobileVerification from "../VerificationWindow/MobileVerification";
import { useChat } from "../../contexts/ChatContext";
import "./ChatBotWindow.css";
import robotPng from "../assets/robot.png";

const ChatBotWindow = () => {
  // const [isOpen, setIsOpen] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  // Placeholder toggle state
  const [placeholderToggle, setPlaceholderToggle] = useState(false);

  const {
    flowCompleted,
    handleUserInput,
    addUserContactInfo,
    getCurrentStepConfig,
  } = useChat();

  // Animated placeholder text using React Spring
  const placeholderAnimation = useSpring({
    opacity: 1,
    transform: "translateY(0px)",
    from: { opacity: 0, transform: "translateY(5px)" },
    reset: placeholderToggle,
    config: { tension: 280, friction: 20 },
  });

  const placeholderText = flowCompleted
    ? placeholderToggle
      ? "Ask me anything about Flexwork..."
      : "Type bye or exit to end conversation"
    : "Type your response...";

  // Toggle placeholder every 3 seconds when flowCompleted
  useEffect(() => {
    let interval;
    if (flowCompleted) {
      interval = setInterval(() => {
        setPlaceholderToggle((prev) => !prev);
      }, 3000);
    } else {
      setPlaceholderToggle(false);
    }
    return () => interval && clearInterval(interval);
  }, [flowCompleted]);

  // Performance optimized animation for the chat window
  const chatAnimation = useSpring({
    // opacity: isOpen ? 1 : 0,
    // transform: isOpen ? 'scale(1)' : 'scale(0.5)',
    transformOrigin: "bottom right",
    config: config.gentle, // Using predefined gentle config for smoother animation
  });

  const handleVerificationComplete = (contactData) => {
    setIsVerified(true);

    // Extract contact information
    const contactInfo = {
      name: contactData.name,
      email: contactData.email,
      phone: contactData.phone,
      contactMethod: contactData.contactMethod,
      contactValue: contactData.contactValue,
    };

    // Pass all contact information to the context
    addUserContactInfo(contactInfo);
  };

  const currentStepConfig = getCurrentStepConfig();

  return (
    <>
      <animated.div className="chatbot shadow-lg" style={chatAnimation}>
        {!isVerified ? (
          <MobileVerification onProceedToBot={handleVerificationComplete} />
        ) : (
          <div
            className="d-flex flex-column h-100 justify-content-between getstarted"
            style={{ padding: "28px 18px 10px" }}
          >
            <div>
              <FwLogo />
            </div>
            <div className="p-0 d-flex flex-column flex-grow-1 overflow-hidden">
              <div class="p-2 h-100" style={{ flex: 1, overflowY: "auto" }}>
                <ChatMessages />
              </div>
              <div class="p-2 flex-shrink-1">
                {currentStepConfig.type === "options" && !flowCompleted && (
                  <ChatOptions
                    options={currentStepConfig.options || []}
                    onSelect={handleUserInput}
                  />
                )}
                {(currentStepConfig.type === "input" ||
                  currentStepConfig.type === "open_chat" ||
                  (flowCompleted &&
                    currentStepConfig.type !== "final" &&
                    !currentStepConfig.disableInput)) && (
                  <ChatInput
                    placeholder={
                      flowCompleted ? placeholderText : "Type your response..."
                    }
                    inputType={currentStepConfig.inputType || "text"}
                    placeholderAnimation={
                      flowCompleted ? placeholderAnimation : null
                    }
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </animated.div>
    </>
  );
};

export const FwLogo = () => {
  return (
    <div className="logo-container py-2">
      <svg
        width="141"
        height="28"
        viewBox="0 0 141 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g clip-path="url(#clip0_861_658)">
          <path
            d="M42.2227 28.0009L42.5403 27.1088L47.674 18.2773L47.9916 18.4661L42.8626 27.2976L42.2227 28.0009Z"
            fill="white"
          />
          <path
            d="M40.0039 5.00781L40.4305 6.19729L47.2708 17.9788L47.7021 17.7287L40.8572 5.94713L40.0039 5.00781Z"
            fill="white"
          />
          <path
            d="M47.7011 18.3902L43.1409 26.2492C40.0123 24.7388 37.8555 21.5432 37.8555 17.8521C37.8555 14.1609 39.7895 11.3005 42.6621 9.70508L47.7011 18.3902Z"
            fill="white"
          />
          <path
            d="M47.0622 20.1166C48.0727 20.1166 48.8919 19.3009 48.8919 18.2946C48.8919 17.2884 48.0727 16.4727 47.0622 16.4727C46.0516 16.4727 45.2324 17.2884 45.2324 18.2946C45.2324 19.3009 46.0516 20.1166 47.0622 20.1166Z"
            fill="white"
          />
          <path
            d="M12.6945 3.57316H11.1065C8.49934 3.76197 6.4231 5.94268 6.4231 8.6143V9.40256H9.21987V12.9757H6.4231V26.3291H2.75885V12.9757H0V9.40256H2.75885V8.6143C2.75885 3.95078 6.4231 0.415374 11.0307 0H16.3587V26.3338H12.6945V3.57316Z"
            fill="white"
          />
          <path
            d="M28.3706 23.1717C29.8069 23.1717 31.1294 22.6053 32.414 21.4394L35.2108 23.7712C33.1725 25.6876 30.8687 26.7071 28.3753 26.7071C23.2748 26.7071 19.1934 22.7563 19.1934 17.8663C19.1934 12.9762 23.2748 9.02539 28.3753 9.02539C31.8879 9.02539 34.5329 10.9795 36.083 13.9532L24.6352 21.7037C25.5785 22.6053 26.8632 23.1717 28.3753 23.1717H28.3706ZM22.8908 17.8663C22.8908 18.2061 22.8908 18.5035 22.9666 18.8433L30.9398 13.5001C30.4847 12.9714 29.6552 12.5608 28.3706 12.5608C25.3463 12.5608 22.8908 14.9681 22.8908 17.8663Z"
            fill="white"
          />
          <path
            d="M80.1434 26.3347L73.9858 13.7696L67.8281 26.3347H64.3156L56.0059 9.4082H59.7839L66.0553 21.9733L72.2508 9.4082H75.6117L81.8831 21.9733L88.1924 9.4082H91.8188L83.6607 26.3347H80.1482H80.1434Z"
            fill="#FFCD00"
          />
          <path
            d="M91.668 17.8663C91.668 12.9762 95.7494 9.02539 100.85 9.02539C105.95 9.02539 109.994 12.9762 109.994 17.8663C109.994 22.7563 105.913 26.7071 100.85 26.7071C95.7873 26.7071 91.668 22.7563 91.668 17.8663ZM95.3701 17.8663C95.3701 20.7644 97.8256 23.1717 100.85 23.1717C103.874 23.1717 106.33 20.7644 106.33 17.8663C106.33 14.9681 103.836 12.5608 100.85 12.5608C97.8635 12.5608 95.3701 14.9681 95.3701 17.8663Z"
            fill="#FFCD00"
          />
          <path
            d="M116.559 17.8654V26.3287H112.895V9.40219H116.559V10.9834C117.957 9.85533 120.033 9.0293 122.039 9.0293H122.569V12.5647H122.039C119.052 12.5647 116.559 14.9342 116.559 17.8702V17.8654Z"
            fill="#FFCD00"
          />
          <path
            d="M130.652 17.2664L128.235 19.1827V26.3291H124.57V0H128.235V15.1612L136.056 9.40728H141.005L133.525 15.2367L140.512 26.3338H136.317L130.652 17.2664Z"
            fill="#FFCD00"
          />
          <path
            d="M42.1659 13.7792C42.2655 13.7792 42.365 13.7367 42.4361 13.6659L42.4551 13.647C42.5262 13.5762 42.5641 13.4771 42.5641 13.378C42.5641 13.2788 42.5215 13.1797 42.4504 13.1089L41.8246 12.4953C41.7535 12.4245 41.6492 12.3867 41.5544 12.3867C41.4549 12.3867 41.3553 12.4292 41.2842 12.5L41.2653 12.5189C41.1942 12.5897 41.1562 12.6888 41.1562 12.7879C41.1562 12.8871 41.1989 12.9862 41.27 13.057L41.8957 13.6706C41.9668 13.7414 42.0616 13.7792 42.1612 13.7792H42.1659Z"
            fill="#FFCD00"
          />
          <path
            d="M40.0323 14.6759L40.8097 15.1527C40.8713 15.1904 40.9377 15.2093 41.0088 15.2093C41.0373 15.2093 41.0657 15.2093 41.0989 15.1999C41.1984 15.1763 41.2837 15.1149 41.3359 15.0299L41.3501 15.0063C41.4591 14.827 41.4023 14.5957 41.2269 14.4871L40.4495 14.0104C40.3641 13.9585 40.2598 13.9396 40.1603 13.9632C40.0608 13.9868 39.9754 14.0481 39.9233 14.1331L39.9091 14.1567C39.8 14.3361 39.8569 14.5674 40.0323 14.6806V14.6759Z"
            fill="#FFCD00"
          />
          <path
            d="M39.2825 16.4502L40.0694 16.7287C40.1121 16.7429 40.1547 16.7523 40.1974 16.7523C40.3538 16.7523 40.5008 16.6532 40.5577 16.4975L40.5671 16.4739C40.6382 16.2756 40.5339 16.0585 40.3349 15.9877L39.548 15.7092C39.4532 15.6761 39.3489 15.6809 39.2588 15.7233C39.1687 15.7658 39.0976 15.8413 39.0645 15.9405L39.055 15.9641C39.0218 16.0585 39.0265 16.1623 39.0692 16.252C39.1119 16.3417 39.1877 16.4125 39.2873 16.4455L39.2825 16.4502Z"
            fill="#FFCD00"
          />
          <path
            d="M40.5061 18.1023V18.074C40.4919 17.8663 40.3165 17.7058 40.1032 17.7152L39.2642 17.7624C39.1646 17.7672 39.0698 17.8144 39.0035 17.8899C38.9371 17.9654 38.9039 18.0645 38.9086 18.1637V18.192C38.9229 18.3949 39.0888 18.5507 39.2879 18.5507C39.2974 18.5507 39.3021 18.5507 39.3116 18.5507L40.1506 18.5035C40.3592 18.4893 40.5203 18.31 40.5109 18.1023H40.5061Z"
            fill="#FFCD00"
          />
          <path
            d="M40.8142 19.8027L40.8047 19.7791C40.7194 19.5856 40.4966 19.5006 40.3022 19.5809L39.5438 19.9066C39.3494 19.9915 39.2641 20.2134 39.3447 20.4069L39.3542 20.4305C39.3968 20.5249 39.4679 20.5957 39.5627 20.6335C39.6101 20.6524 39.6575 20.6618 39.7049 20.6618C39.7571 20.6618 39.8092 20.6524 39.8566 20.6288L40.6151 20.3031C40.8094 20.2181 40.8948 19.9963 40.8142 19.8027Z"
            fill="#FFCD00"
          />
          <path
            d="M41.7331 21.4362C41.6715 21.356 41.5814 21.304 41.4819 21.2946C41.3823 21.2804 41.2828 21.3088 41.2022 21.3701L40.5291 21.8941C40.3632 22.0215 40.3347 22.2622 40.4627 22.4274L40.4817 22.4463C40.5575 22.5407 40.6665 22.5926 40.7803 22.5926C40.8609 22.5926 40.9462 22.5643 41.0126 22.5124L41.6857 21.9885C41.8516 21.861 41.88 21.6203 41.7521 21.4551L41.7331 21.4362Z"
            fill="#FFCD00"
          />
          <path
            d="M43.1656 22.8374L43.1466 22.8185C43.0708 22.7524 42.9712 22.7147 42.8717 22.7241C42.7721 22.7288 42.6773 22.776 42.611 22.8515L42.0706 23.451C41.9331 23.6068 41.9426 23.8475 42.1038 23.9891L42.1227 24.008C42.1938 24.0693 42.2839 24.1071 42.374 24.1071C42.3834 24.1071 42.3882 24.1071 42.3977 24.1071C42.4972 24.1024 42.592 24.0552 42.6584 23.9797L43.1988 23.3802C43.3362 23.2244 43.3268 22.9837 43.1656 22.8468V22.8374Z"
            fill="#FFCD00"
          />
          <path
            d="M56.2864 17.8525C56.2864 19.7122 55.7365 21.4493 54.7932 22.9031L51.584 17.3663L54.4898 12.3535C55.6227 13.897 56.2911 15.7945 56.2911 17.8478L56.2864 17.8525Z"
            fill="white"
          />
          <path
            d="M47.0627 19.3256C47.6334 19.3256 48.0961 18.8649 48.0961 18.2966C48.0961 17.7283 47.6334 17.2676 47.0627 17.2676C46.492 17.2676 46.0293 17.7283 46.0293 18.2966C46.0293 18.8649 46.492 19.3256 47.0627 19.3256Z"
            fill="#FFCD00"
          />
          <path
            d="M52.1822 10.2388C52.1822 10.2388 51.0635 11.0223 48.9872 8.69528C48.9872 8.69528 48.1008 7.78901 46.911 8.41679C46.911 8.41679 46.3042 8.80384 46.437 9.40802L49.6461 14.586L52.1869 10.2388H52.1822Z"
            fill="#FFCD00"
          />
          <path
            d="M49.6544 20.959L46.668 26.2314L52.6407 26.2408L49.6544 20.959ZM49.1377 23.4984H50.1236L51.3703 25.6178H47.9384L49.1377 23.4984Z"
            fill="#FFCD00"
          />
          <path
            d="M54.7507 15.5072L54.0017 15.8753C53.9638 15.8942 53.9211 15.9084 53.8784 15.9131C53.722 15.932 53.5656 15.8517 53.4897 15.7054L53.4755 15.6818C53.3807 15.493 53.4613 15.2664 53.6462 15.172L54.3951 14.8039C54.4852 14.7567 54.5895 14.7519 54.6843 14.785C54.7791 14.818 54.8597 14.8841 54.9023 14.9785L54.9118 15.0021C54.9592 15.0918 54.964 15.1956 54.9308 15.29C54.8976 15.3844 54.8312 15.4647 54.7364 15.5072H54.7507Z"
            fill="#FFCD00"
          />
          <path
            d="M53.7353 17.2905V17.2622C53.7211 17.0545 53.8775 16.8704 54.0908 16.861L54.9298 16.809C55.0294 16.8043 55.1289 16.8374 55.2048 16.9034C55.2806 16.9695 55.328 17.0639 55.3328 17.163V17.1914C55.347 17.3943 55.2 17.569 55.0009 17.5926C54.9914 17.5926 54.9867 17.5926 54.9772 17.5926L54.1382 17.6445C53.9296 17.6587 53.7495 17.4982 53.7353 17.2905Z"
            fill="#FFCD00"
          />
          <path
            d="M53.6277 19.0182L53.6372 18.9899C53.6988 18.7917 53.9121 18.6737 54.1112 18.735L54.9028 18.971C55.1019 19.0324 55.2204 19.2448 55.1588 19.4431L55.1493 19.4714C55.1209 19.5705 55.0545 19.6507 54.9644 19.6979C54.9218 19.7215 54.8744 19.7357 54.827 19.7404C54.7748 19.7451 54.7227 19.7404 54.6753 19.7263L53.8837 19.4903C53.6846 19.4289 53.5661 19.2165 53.6277 19.0182Z"
            fill="#FFCD00"
          />
        </g>
        <defs>
          <clipPath id="clip0_861_658">
            <rect width="141" height="28" fill="white" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
};

export default ChatBotWindow;
