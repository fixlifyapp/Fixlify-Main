import { useClientCustomFields } from "@/hooks/useClientCustomFields";
import { EntityCustomFieldsCard } from "@/components/shared/EntityCustomFieldsCard";

interface ClientCustomFieldsCardProps {
  clientId: string;
  embedded?: boolean;
}

export const ClientCustomFieldsCard = ({ clientId, embedded = false }: ClientCustomFieldsCardProps) => {
  const {
    customFieldValues,
    availableFields,
    isLoading,
    saveCustomFieldValues,
    refreshFields
  } = useClientCustomFields(clientId);

  // Transform values to match unified component interface
  const fieldValues = customFieldValues.map(cfv => ({
    id: cfv.id,
    custom_field_id: cfv.custom_field_id,
    value: cfv.value
  }));

  const handleSave = async (values: Record<string, string>) => {
    return await saveCustomFieldValues(clientId, values);
  };

  return (
    <EntityCustomFieldsCard
      entityType="client"
      entityId={clientId}
      availableFields={availableFields}
      fieldValues={fieldValues}
      isLoading={isLoading}
      onSave={handleSave}
      onRefresh={refreshFields}
      embedded={embedded}
    />
  );
};
