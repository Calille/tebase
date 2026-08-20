import React from "react";
import PageLayout from "@/components/tebase/PageLayout";
import Vacancies from "@/components/tebase/vacancies/Vacancies";

const VacanciesPage = () => {
  return (
    <PageLayout title="Vacancies">
      <Vacancies />
    </PageLayout>
  );
};

export default VacanciesPage;
