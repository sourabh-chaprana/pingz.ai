import { Redirect } from 'expo-router';

export default function TemplateEditorIndex() {
  // Redirect to a default template or back to templates
  return <Redirect href="/templates" />;
} 