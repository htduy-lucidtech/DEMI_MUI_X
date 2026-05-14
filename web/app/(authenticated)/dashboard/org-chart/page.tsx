"use client";

import React, { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Panel,
  Handle,
  Position,
  Node,
  Edge,
  BackgroundVariant
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Box, Typography, Paper, CircularProgress, Stack, Button } from '@mui/material';
import { useTranslations } from 'next-intl';
import { AccountTree as DeptIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { departmentsService, Department } from '@/services/departments.service';
import PageHeader from '@/components/common/PageHeader';

// Custom Node Component for Departments
const DeptNode = ({ data }: any) => {
  return (
    <Paper
      sx={{
        p: 2,
        borderRadius: 3,
        minWidth: 200,
        textAlign: 'center',
        border: '2px solid',
        borderColor: data.isRoot ? 'primary.main' : '#e2e8f0',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        bgcolor: 'background.paper',
        position: 'relative',
        '&:hover': {
          borderColor: 'primary.light',
          transform: 'translateY(-2px)',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
        }
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: '#94a3b8', width: 8, height: 8 }} />
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
        <Box sx={{ 
          width: 44, 
          height: 44, 
          borderRadius: 2, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          bgcolor: data.isRoot ? 'primary.main' : 'primary.light',
          color: 'white',
          mb: 0.5,
          boxShadow: data.isRoot ? '0 0 15px rgba(25, 118, 210, 0.4)' : 'none'
        }}>
          <DeptIcon />
        </Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.2 }}>
          {data.label}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500, display: 'block', mt: 0.5 }}>
          {data.description || 'Department'}
        </Typography>
      </Box>
      <Handle type="source" position={Position.Bottom} style={{ background: '#94a3b8', width: 8, height: 8 }} />
    </Paper>
  );
};

const nodeTypes = {
  deptNode: DeptNode,
};

export default function OrgChartPage() {
  const t = useTranslations('OrgChart');
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);

  const buildChart = (depts: Department[]) => {
    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];
    
    // Group departments by level and parent
    const parentMap = new Map<number | null, Department[]>();
    depts.forEach(d => {
      const pId = d.parentId || null;
      if (!parentMap.has(pId)) parentMap.set(pId, []);
      parentMap.get(pId)!.push(d);
    });

    const levelNodesCount = new Map<number, number>();
    const nodeWidth = 280;
    const nodeHeight = 220;

    const processLevel = (parentId: number | null, level: number) => {
      const children = parentMap.get(parentId) || [];
      
      children.forEach((child, index) => {
        const count = levelNodesCount.get(level) || 0;
        const childId = child.id!.toString();
        
        // Simple horizontal centering logic (offset by half total width of current level nodes)
        // For a more professional look, usually dagre or similar is used
        const xPos = (count - (children.length / 2)) * nodeWidth + 400;

        newNodes.push({
          id: childId,
          type: 'deptNode',
          data: { 
            label: child.name, 
            description: child.description,
            isRoot: level === 0 
          },
          position: { x: xPos, y: level * nodeHeight },
        });

        levelNodesCount.set(level, count + 1);

        if (parentId !== null) {
          newEdges.push({
            id: `e${parentId}-${childId}`,
            source: parentId.toString(),
            target: childId,
            animated: true,
            style: { stroke: '#94a3b8', strokeWidth: 2 },
          });
        }
        processLevel(child.id!, level + 1);
      });
    };

    processLevel(null, 0);
    setNodes(newNodes);
    setEdges(newEdges);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await departmentsService.getAll();
      buildChart(data);
    } catch (error) {
      console.error('Failed to load org chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <Box sx={{ height: 'calc(100vh - 180px)', width: '100%', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <PageHeader
        title={t('title')}
        subtitle={t('description')}
        actions={
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadData}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            {t('refresh') || 'Refresh'}
          </Button>
        }
      />

      <Paper
        sx={{
          flexGrow: 1,
          borderRadius: 1.5,
          overflow: 'hidden',
          border: '1px solid #e2e8f0',
          position: 'relative'
        }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <CircularProgress />
          </Box>
        ) : (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            maxZoom={1.5}
            minZoom={0.2}
          >
            <Controls />
            <MiniMap 
              zoomable 
              pannable 
              nodeColor={(n) => n.data?.isRoot ? '#1976d2' : '#f8fafc'}
              style={{ borderRadius: 8, border: '1px solid #e2e8f0' }}
            />
            <Background color="#cbd5e1" gap={20} variant={BackgroundVariant.Dots} />
            <Panel position="top-left">
              <Paper sx={{ p: 1.5, borderRadius: 2, border: '1px solid #e2e8f0', bgcolor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)' }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 0.5 }}>
                  {t('instructions')}
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', color: 'text.primary' }}>
                  • {t('zoom_instruction')}
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', color: 'text.primary' }}>
                  • {t('move_instruction')}
                </Typography>
              </Paper>
            </Panel>
          </ReactFlow>
        )}
      </Paper>
    </Box>
  );
}

