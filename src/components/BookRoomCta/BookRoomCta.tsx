"use client";

import React, {
  Dispatch,
  FC,
  SetStateAction,
  useState,
  useEffect,
} from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import styles from "./BookRoomCta.module.css";

type Props = {
  checkinDate: Date | null;
  setCheckinDate: Dispatch<SetStateAction<Date | null>>;
  checkoutDate: Date | null;
  setCheckoutDate: Dispatch<SetStateAction<Date | null>>;
  setAdults: Dispatch<SetStateAction<number>>;
  setNoOfChildren: Dispatch<SetStateAction<number>>;
  calcMinCheckoutDate: () => Date | null;
  price: number;
  discount: number;
  adults: number;
  noOfChildren: number;
  specialNote: string;
  isBooked: boolean;
  handleBookNowClick: () => void;
};

const BookRoomCta: FC<Props> = (props) => {
  const {
    price,
    discount,
    specialNote,
    checkinDate,
    setCheckinDate,
    checkoutDate,
    setCheckoutDate,
    calcMinCheckoutDate,
    setAdults,
    setNoOfChildren,
    adults,
    noOfChildren,
    isBooked,
    handleBookNowClick,
  } = props;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [senderAddress, setSenderAddress] = useState("");
  const [showQR, setShowQR] = useState(false);
  const [timeLeft, setTimeLeft] = useState(20 * 60); // 20 minutes in seconds
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);

  const discountPrice = price - (price / 100) * discount;

  const calcNoOfDays = () => {
    if (!checkinDate || !checkoutDate) return 0;
    const timeDiff = checkoutDate.getTime() - checkinDate.getTime();
    const noOfDays = Math.ceil(timeDiff / (24 * 60 * 60 * 1000));
    return noOfDays;
  };

  const handleCheckoutClick = () => {
    setIsModalOpen(true);
    setAmount((calcNoOfDays() * discountPrice).toString());
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isModalOpen && checkoutStep === 2 && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isModalOpen, checkoutStep, timeLeft]);

  const handlePaymentConfirmation = () => {
    setPaymentStatus("Your payment is processing");

    // Simulate payment processing
    setTimeout(() => {
      setPaymentStatus("Payment approved");
    }, 1000); // 1 second delay to simulate processing
  };

  const renderRoomDetails = () => (
    <div className={styles.roomDetails}>
      <div className={styles.roomDetailsHeader}>
        <span className={styles.roomDetailsTitle}>Room Details</span>
        <span className={styles.roomDetailsIcon}>🏨</span>
      </div>
      <div className={styles.roomDetailsContent}>
        <p>
          <strong>Check-in:</strong> {checkinDate?.toDateString()}
        </p>
        <p>
          <strong>Check-out:</strong> {checkoutDate?.toDateString()}
        </p>
        <p>
          <strong>Guests:</strong> {adults} adults, {noOfChildren} children
        </p>
        <p>
          <strong>Total Nights:</strong> {calcNoOfDays()}
        </p>
      </div>
    </div>
  );

  const renderCheckoutStep1 = () => (
    <div className={styles.checkoutStep}>
      {renderRoomDetails()}
      <div className={styles.inputGroup}>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
        />
      </div>
      <div className={styles.inputGroup}>
        <label htmlFor="name">Name (Optional)</label>
        <input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
        />
      </div>
      <button onClick={() => setCheckoutStep(2)} className={styles.nextButton}>
        Next <span className={styles.arrowIcon}>→</span>
      </button>
      <p style={{ alignSelf: "center", fontSize: 12 }}>
        Powered by BananaCrystal
      </p>
    </div>
  );

  const renderCheckoutStep2 = () => (
    <div className={styles.checkoutStep}>
      {renderRoomDetails()}
      <div className={styles.amountDisplay}>
        <label htmlFor="amount">Amount (USDT)</label>
        <input
          id="amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className={styles.amountInput}
        />
      </div>

      <div className={styles.timeRemaining}>
        <p className={styles.timeRemainingTitle}>Time Remaining</p>
        <p className={styles.timeRemainingValue}>{formatTime(timeLeft)}</p>
      </div>

      <div className={styles.inputGroup}>
        <label htmlFor="walletAddress">
          Recipient USDT Address (Polygon Network)
        </label>
        <div className={styles.walletAddressContainer}>
          <input
            id="walletAddress"
            value="0x1234567890123456789012345678901234567890" // Replace with actual wallet address
            readOnly
          />
          <button
            onClick={() =>
              handleCopy("0x1234567890123456789012345678901234567890")
            }
            className={styles.copyButton}
          >
            Copy
          </button>
        </div>
      </div>

      <div className={styles.inputGroup}>
        <label htmlFor="senderAddress">
          Your USDT Address (for verification)
        </label>
        <input
          id="senderAddress"
          value={senderAddress}
          onChange={(e) => setSenderAddress(e.target.value)}
          placeholder="Enter your USDT address"
        />
      </div>

      <div className={styles.alertMessage}>
        <span className={styles.alertIcon}>⚠️</span>
        <span>
          <strong>Polygon Network Only!</strong> Ensure you&apos;re sending USDT
          on the Polygon network.
        </span>
      </div>

      {showQR && (
        <div className={styles.qrContainer}>
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
              `https://example.com/pay?address=0x1234567890123456789012345678901234567890&amount=${amount}&currency=USDT`
            )}`}
            alt="Payment QR Code"
            className={styles.qrCode}
          />
        </div>
      )}

      <button
        onClick={() =>
          handleCopy(
            `https://example.com/pay?address=0x1234567890123456789012345678901234567890&amount=${amount}&currency=USDT`
          )
        }
        className={styles.copyLinkButton}
      >
        Copy Payment Link
      </button>
      <button
        onClick={() => setShowQR(!showQR)}
        className={styles.toggleQrButton}
      >
        {showQR ? "Hide" : "Show"} QR Code
      </button>
      {paymentStatus === "Payment approved" ? null : (
        <button
          onClick={handlePaymentConfirmation}
          className={styles.paymentConfirmButton}
          disabled={!!paymentStatus}
        >
          {!paymentStatus ? "I have paid" : "Please wait..."}
        </button>
      )}

      {paymentStatus && (
        <div className={styles.paymentStatus}>{paymentStatus}</div>
      )}
      <p style={{ alignSelf: "center", fontSize: 12 }}>
        Powered by BananaCrystal
      </p>
    </div>
  );

  return (
    <div className={styles.bookRoomCta}>
      <h3 className={styles.priceDisplay}>
        <span className={`${discount ? styles.discountedPrice : ""}`}>
          $ {price}
        </span>
        {discount ? (
          <span className={styles.discountInfo}>
            {" "}
            | discount {discount}%. Now{" "}
            <span className={styles.finalPrice}>$ {discountPrice}</span>
          </span>
        ) : (
          ""
        )}
      </h3>

      <div className={styles.divider} />

      <h4 className={styles.specialNote}>{specialNote}</h4>

      <div className={styles.datePickerContainer}>
        <div className={styles.datePicker}>
          <label htmlFor="check-in-date">Check In date</label>
          <DatePicker
            selected={checkinDate}
            onChange={(date) => setCheckinDate(date)}
            dateFormat="dd/MM/yyyy"
            minDate={new Date()}
            id="check-in-date"
          />
        </div>
        <div className={styles.datePicker}>
          <label htmlFor="check-out-date">Check Out date</label>
          <DatePicker
            selected={checkoutDate}
            onChange={(date) => setCheckoutDate(date)}
            dateFormat="dd/MM/yyyy"
            disabled={!checkinDate}
            minDate={calcMinCheckoutDate()}
            id="check-out-date"
          />
        </div>
      </div>

      <div className={styles.guestInputContainer}>
        <div className={styles.guestInput}>
          <label htmlFor="adults">Adults</label>
          <input
            type="number"
            id="adults"
            value={adults}
            onChange={(e) => setAdults(+e.target.value)}
            min={1}
            max={5}
          />
        </div>
        <div className={styles.guestInput}>
          <label htmlFor="children">Children</label>
          <input
            type="number"
            id="children"
            value={noOfChildren}
            onChange={(e) => setNoOfChildren(+e.target.value)}
            min={0}
            max={3}
          />
        </div>
      </div>

      {calcNoOfDays() > 0 && (
        <p className={styles.totalPrice}>
          Total Price: $ {calcNoOfDays() * discountPrice}
        </p>
      )}

      <button
        onClick={handleCheckoutClick}
        className={styles.bookNowButton}
        // disabled={isBooked}
      >
        Book Now
      </button>

      {isModalOpen && (
        <div
          className={styles.modalOverlay}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={styles.closeModal}
              onClick={() => setIsModalOpen(false)}
            >
              ×
            </button>
            <h2 className={styles.modalTitle}>Checkout</h2>
            {checkoutStep === 1 ? renderCheckoutStep1() : renderCheckoutStep2()}
          </div>
        </div>
      )}
    </div>
  );
};

export default BookRoomCta;
