"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const defaultTemplate = `Subject: Welcome to Saarway — Your Farm Credentials

Dear [Owner Name],

Your farm registration has been approved! Here are your login details:

Farm ID: [Farm ID]
Username: [auto-generated]
Temporary Password: [auto-generated]

Please login at saarway.com/farm-login and change your password immediately.

Welcome to Saarway — Farm. Track. Thrive.`;

const PlatformSettings = () => {
  const { toast } = useToast();
  const [subFee, setSubFee] = useState("50");
  const [listFee, setListFee] = useState("50");
  const [platformName, setPlatformName] = useState("Saarway");
  const [contactEmail, setContactEmail] = useState("info@saarway.com");
  const [emailTemplate, setEmailTemplate] = useState(defaultTemplate);

  const handleSave = () => {
    toast({ title: "Settings Saved", description: "Platform settings updated successfully." });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-foreground">Platform Settings</h1>

      <Card>
        <CardHeader><CardTitle className="text-base">Fee Configuration</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Subscription Fee Rate (PKR/animal/month)</label>
              <Input type="number" value={subFee} onChange={(e) => setSubFee(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Listing Fee Rate (PKR/listing)</label>
              <Input type="number" value={listFee} onChange={(e) => setListFee(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Farm ID Range</label>
            <Input value="1–999 (auto-incremented)" disabled className="bg-muted" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Platform Info</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Platform Name</label>
            <Input value={platformName} onChange={(e) => setPlatformName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Contact Email</label>
            <Input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Credential Email Template</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Textarea value={emailTemplate} onChange={(e) => setEmailTemplate(e.target.value)} rows={12} className="font-mono text-sm" />
        </CardContent>
      </Card>

      <Button className="bg-sw-admin-green text-sw-admin-bg hover:bg-sw-admin-green/90 hover:scale-[1.02] transition-all font-semibold" onClick={handleSave}>
        Save Changes
      </Button>
    </div>
  );
};

export default PlatformSettings;
