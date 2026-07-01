import { Link } from 'react-router-dom';
import Button from '../components/common/Button';
import Logo from '../components/common/Logo';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-6 bg-app-bg">
      <Logo size={56} className="mb-6" />
      <h1 className="text-5xl font-bold gradient-text mb-3">404</h1>
      <p className="text-text-muted mb-8">This page floated off into the void.</p>
      <Link to="/"><Button>Back to home</Button></Link>
    </div>
  );
}
