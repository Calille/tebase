import React from "react";
import PageLayout from "@/components/tebase/PageLayout";
import Invoices from "@/components/tebase/invoices/Invoices";

const InvoicesPage = () => {
  return (
    <PageLayout title="Invoices">
      <Invoices />
    </PageLayout>
  );
};

export default InvoicesPage;
