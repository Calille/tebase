import React from "react";

const MissingConfigPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
      <div className="max-w-lg rounded-lg border bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Tebase is not configured</h1>
        <p className="mt-3 text-sm text-gray-600">
          This deploy is missing the Supabase URL or anon key, so sign-in
          cannot work. In the Vercel project, set both of these for
          Production and Preview:
        </p>
        <ul className="mt-4 list-disc space-y-1 pl-5 font-mono text-sm text-gray-800">
          <li>VITE_SUPABASE_URL</li>
          <li>VITE_SUPABASE_ANON_KEY</li>
        </ul>
        <p className="mt-4 text-sm text-gray-600">
          Then redeploy. Also add this site’s origin (and{" "}
          <code className="rounded bg-gray-100 px-1">/reset-password</code>)
          to the Supabase Auth redirect allow-list.
        </p>
      </div>
    </div>
  );
};

export default MissingConfigPage;
