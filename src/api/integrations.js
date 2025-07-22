// Direct integration implementations (replacing Base44 SDK)

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

// Core integrations
export const Core = {
  // Placeholder for core functionality
};

// LLM Integration
export const InvokeLLM = async (prompt, options = {}) => {
  const response = await fetch(`${API_BASE}/llm/invoke`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, ...options })
  });
  if (!response.ok) throw new Error('Failed to invoke LLM');
  return response.json();
};

// Email Integration
export const SendEmail = async (to, subject, body, options = {}) => {
  const response = await fetch(`${API_BASE}/email/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to, subject, body, ...options })
  });
  if (!response.ok) throw new Error('Failed to send email');
  return response.json();
};

// File Upload Integration
export const UploadFile = async (file, options = {}) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    body: formData
  });
  if (!response.ok) throw new Error('Failed to upload file');
  return response.json();
};

// Image Generation Integration
export const GenerateImage = async (prompt, options = {}) => {
  const response = await fetch(`${API_BASE}/image/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, ...options })
  });
  if (!response.ok) throw new Error('Failed to generate image');
  return response.json();
};

// Data Extraction Integration
export const ExtractDataFromUploadedFile = async (fileId, options = {}) => {
  const response = await fetch(`${API_BASE}/extract/${fileId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(options)
  });
  if (!response.ok) throw new Error('Failed to extract data from file');
  return response.json();
};






