"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import CampaignForm from "@/components/admin/CampaignForm";

interface Campaign {
  id: string;
  title: string;
  whatsappTemplateSid: string | null;
  whatsappTemplateVariables: string | null;
  emailBody: string | null;
  link: string;
}

export default function EditCampaignPage() {
  const params = useParams();
  const id = params.id as string;
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCampaign() {
      try {
        const response = await fetch(`/api/admin/campaigns/${id}`);
        if (response.ok) {
          const data = await response.json();
          setCampaign(data);
        }
      } catch (error) {
        console.error("Error fetching campaign:", error);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchCampaign();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading campaign...</div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-muted">Campaign not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Edit Campaign</h1>
      <CampaignForm
        initialData={{
          title: campaign.title,
          whatsappTemplateSid: campaign.whatsappTemplateSid || "",
          whatsappTemplateVariables: campaign.whatsappTemplateVariables || "",
          emailBody: campaign.emailBody || "",
          link: campaign.link,
        }}
        resourceId={campaign.id}
      />
    </div>
  );
}
