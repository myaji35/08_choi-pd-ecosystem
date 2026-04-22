import IntegrationProjectForm, { type ProjectFormValues } from '../_form';

const initial: ProjectFormValues = {
  key: '',
  name: '',
  description: '',
  baseUrl: '',
  apiBaseUrl: '',
  endpointTemplate: '/api/integrations/public/{external_id}',
  authType: 'none',
  authCredential: '',
  adapterKey: '',
  brandColor: '',
  logoUrl: '',
  isEnabled: true,
  sortOrder: 0,
};

export default function NewIntegrationProjectPage() {
  return <IntegrationProjectForm mode="create" initial={initial} />;
}
