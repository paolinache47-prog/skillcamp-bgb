import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/manrope/wght.css';
import '@fontsource-variable/inter/wght.css';
import './styles/tokens.css';
import './styles/app.css';
import { CourseShell } from './components/CourseShell';
import { resolveCourse } from './content/lesson';

const content = resolveCourse(window.location.search);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CourseShell content={content} />
  </StrictMode>,
);
