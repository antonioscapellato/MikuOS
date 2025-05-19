import { useMemo } from 'react';
import dynamic from 'next/dynamic';

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false
});

interface SearchTerm {
  term: string;
  count: number;
  relatedTerms: string[];
}

interface MemoryGraphProps {
  searchHistory: SearchTerm[];
}

interface GraphData {
  nodes: Array<{
    id: string;
    name: string;
    val: number;
    color: string;
  }>;
  links: Array<{
    source: string;
    target: string;
    value: number;
  }>;
}

export default function MemoryGraph({ searchHistory }: MemoryGraphProps) {
  const graphData = useMemo(() => {
    const data: GraphData = {
      nodes: [],
      links: []
    };

    // Add main terms and their relationships
    searchHistory.forEach(item => {
      // Add main term node
      data.nodes.push({
        id: item.term,
        name: item.term,
        val: Math.log(item.count) * 10, // Logarithmic scaling for better visualization
        color: '#000000' // Primary nodes are black
      });

      // Add related terms and links
      item.relatedTerms.forEach(relatedTerm => {
        // Add related term node if it doesn't exist
        if (!data.nodes.find(node => node.id === relatedTerm)) {
          data.nodes.push({
            id: relatedTerm,
            name: relatedTerm,
            val: 3, // Smaller size for related terms
            color: '#666666' // Related terms are gray
          });
        }

        // Add link between main term and related term
        data.links.push({
          source: item.term,
          target: relatedTerm,
          value: 1
        });
      });
    });

    // Sort nodes by size for better visualization
    data.nodes.sort((a, b) => b.val - a.val);

    return data;
  }, [searchHistory]);

  return (
    <div className="h-[calc(100vh-12rem)] w-screen p-4">
      <ForceGraph2D
        graphData={graphData}
        nodeLabel="name"
        nodeColor="color"
        nodeVal="val"
        linkWidth={1}
        linkColor={() => '#cccccc'}
        nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
          const label = node.name;
          const fontSize = node.val * 1.5;
          ctx.font = `${fontSize}px Sans-Serif`;
          ctx.fillStyle = node.color;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(label, node.x, node.y);
        }}
        nodePointerAreaPaint={(node: any, color: string, ctx: CanvasRenderingContext2D) => {
          ctx.fillStyle = color;
          const fontSize = node.val * 1.5;
          ctx.font = `${fontSize}px Sans-Serif`;
          const textWidth = ctx.measureText(node.name).width;
          ctx.fillRect(node.x - textWidth/2, node.y - fontSize/2, textWidth, fontSize);
        }}
        cooldownTicks={100}
        onEngineStop={() => {
          // Save final node positions
          console.log('Graph layout stabilized');
        }}
      />
    </div>
  );
}