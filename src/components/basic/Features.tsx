import { ReactNode } from 'react';
import { FaStar, FaGraduationCap, FaSearch, FaBolt, FaHome, FaPlug, FaBrain } from 'react-icons/fa';

interface FeatureProps {
  title: string;
  description: string;
  icon: ReactNode;
}

const Feature = ({ title, description, icon }: FeatureProps) => {
  return (
    <div className="relative p-6 rounded-xl">
      <div className="h-16 w-16 rounded-full flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-default-900 dark:text-default-50 mb-2">{title}</h3>
      <p className="text-default-600 dark:text-default-300">{description}</p>
    </div>
  );
};

export const Features = () => {
  const features = [
    {
      title: 'Autonomous Agent',
      description: 'Miku works independently to complete complex tasks without constant supervision, saving you time and effort.',
      icon: <FaStar className="w-8 h-8 text-default-900" />,
    },
    {
      title: 'Personalized Learning',
      description: 'Miku adapts to your preferences and needs over time, becoming more efficient and personalized with each interaction.',
      icon: <FaGraduationCap className="w-8 h-8 text-default-900" />,
    },
    {
      title: 'Smart Search',
      description: 'Miku understands context and intent, delivering more relevant search results and remembering your preferences.',
      icon: <FaSearch className="w-8 h-8 text-default-900" />,
    },
    {
      title: 'Task Automation',
      description: 'From scheduling meetings to organizing information, Miku handles repetitive tasks so you can focus on what matters.',
      icon: <FaBolt className="w-8 h-8 text-default-900" />,
    },
    {
      title: 'Contextual Memory',
      description: 'Miku remembers your past interactions and preferences, providing a more coherent and personalized experience.',
      icon: <FaBrain className="w-8 h-8 text-default-900" />,
    },
    {
      title: 'Seamless Integration',
      description: 'Miku integrates with your favorite tools and platforms, creating a unified experience across your digital ecosystem.',
      icon: <FaPlug className="w-8 h-8 text-default-900" />,
    },
  ];

  return (
    <div id="features" className="mt-24 py-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-default-900 dark:text-default-50 sm:text-4xl">Why Choose Miku?</h2>
          <p className="mt-6 text-lg leading-8">
            Discover how Miku's advanced capabilities can transform your productivity and digital experience.
          </p>
        </div>
        
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:max-w-none lg:grid-cols-3">
          {features.map((feature, index) => (
            <Feature key={index} {...feature} />
          ))}
        </div>
      </div>
    </div>
  );
};
