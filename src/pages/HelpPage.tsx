import React from "react";
import { Link } from "react-router-dom";
import PageLayout from "@/components/tebase/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const HelpPage = () => {
  return (
    <PageLayout title="Help & Support" contentClassName="max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>Getting around Tebase</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-gray-700">
          <p>
            Use the sidebar to open teachers, schools, bookings, and the
            other agency modules. Sign in with your username or email.
          </p>
          <p>
            Most list screens still use sample data for this release.
            A banner on those pages means edits stay in this browser
            session and are not written to the database. Bookings and
            your own password do persist to Supabase when configured.
          </p>
          <p>
            Forgot your password? Use{" "}
            <Link to="/forgot-password" className="text-blue-700 underline">
              reset password
            </Link>
            . After the email link, you will land on the set-new-password
            screen.
          </p>
          <p>
            Appearance (theme and font size) is saved in this browser
            under Settings.
          </p>
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default HelpPage;
