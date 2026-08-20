import React from "react";
import PageLayout from "@/components/tebase/PageLayout";
import BookingList from "@/components/tebase/bookings/BookingList";

const BookingsPage = () => {
  return (
    <PageLayout title="Bookings">
      <BookingList />
    </PageLayout>
  );
};

export default BookingsPage;
