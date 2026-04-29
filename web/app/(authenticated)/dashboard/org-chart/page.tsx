"use client";

import React, { useCallback } from 'react';
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
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Box, Typography, Paper, Avatar } from '@mui/material';
import { useTranslations } from 'next-intl';

// Custom Node Component
const OrgNode = ({ data }: any) => {
  return (
    <Paper
      sx={{
        p: 2,
        borderRadius: 3,
        minWidth: 200,
        textAlign: 'center',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        bgcolor: data.isRoot ? 'primary.main' : 'background.paper',
        color: data.isRoot ? 'white' : 'text.primary',
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: '#94a3b8' }} />
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
        <Avatar sx={{ bgcolor: data.isRoot ? 'white' : 'primary.light', color: data.isRoot ? 'primary.main' : 'white', fontWeight: 800 }}>
          {data.label.charAt(0)}
        </Avatar>
        <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
          {data.label}
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.8, fontWeight: 600 }}>
          {data.role}
        </Typography>
      </Box>
      <Handle type="source" position={Position.Bottom} style={{ background: '#94a3b8' }} />
    </Paper>
  );
};

const nodeTypes = {
  orgNode: OrgNode,
};

const initialNodes = [
  {
    id: '1',
    type: 'orgNode',
    data: { label: 'Ban Giám đốc', role: 'CEO & Founder', isRoot: true },
    position: { x: 250, y: 0 },
  },
  {
    id: '2',
    type: 'orgNode',
    data: { label: 'Phòng Nhân sự', role: 'Personnel Dept', isRoot: false },
    position: { x: 0, y: 150 },
  },
  {
    id: '3',
    type: 'orgNode',
    data: { label: 'Phòng Kỹ thuật', role: 'Engineering Dept', isRoot: false },
    position: { x: 250, y: 150 },
  },
  {
    id: '4',
    type: 'orgNode',
    data: { label: 'Phòng Kinh doanh', role: 'Sales Dept', isRoot: false },
    position: { x: 500, y: 150 },
  },
  {
    id: '5',
    type: 'orgNode',
    data: { label: 'Nhóm Frontend', role: 'React Team', isRoot: false },
    position: { x: 150, y: 300 },
  },
  {
    id: '6',
    type: 'orgNode',
    data: { label: 'Nhóm Backend', role: '.NET Team', isRoot: false },
    position: { x: 350, y: 300 },
  },
];

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2', animated: true },
  { id: 'e1-3', source: '1', target: '3', animated: true },
  { id: 'e1-4', source: '1', target: '4', animated: true },
  { id: 'e3-5', source: '3', target: '5' },
  { id: 'e3-6', source: '3', target: '6' },
];

export default function OrgChartPage() {
  const t = useTranslations('OrgChart');
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <Box sx={{ height: 'calc(100vh - 180px)', width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
          {t('title')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('description')}
        </Typography>
      </Box>

      <Paper sx={{ flexGrow: 1, borderRadius: 4, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
        >
          <Controls />
          <MiniMap zoomable pannable />
          <Background color="#cbd5e1" gap={20} />
          <Panel position="top-right">
            <Paper sx={{ p: 1, px: 2, borderRadius: 2, fontWeight: 700, fontSize: '0.75rem', bgcolor: 'primary.light', color: 'white' }}>
              Interactive Mode
            </Paper>
          </Panel>
        </ReactFlow>
      </Paper>
    </Box>
  );
}
