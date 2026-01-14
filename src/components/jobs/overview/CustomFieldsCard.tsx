import { useJobCustomFields } from "@/hooks/useJobCustomFields";
import { EntityCustomFieldsCard } from "@/components/shared/EntityCustomFieldsCard";

interface CustomFieldsCardProps {
  jobId: string;
  embedded?: boolean;
}

export const CustomFieldsCard = ({ jobId, embedded = false }: CustomFieldsCardProps) => {
  const {
    customFieldValues,
    availableFields,
    isLoading,
    saveCustomFieldValues,
    refreshFields
  } = useJobCustomFields(jobId);

  // Transform values to match unified component interface
  const fieldValues = customFieldValues.map(cfv => ({
    id: cfv.id,
    custom_field_id: cfv.custom_field_id,
    value: cfv.value
  }));

  const handleSave = async (values: Record<string, string>) => {
    return await saveCustomFieldValues(jobId, values);
  };

  return (
    <EntityCustomFieldsCard
      entityType="job"
      entityId={jobId}
      availableFields={availableFields}
      fieldValues={fieldValues}
      isLoading={isLoading}
      onSave={handleSave}
      onRefresh={refreshFields}
      embedded={embedded}
    />
  );
};
