import React from 'react';
import { Typography, Stack } from '@mui/material';
import { InboxOutlined as EmptyIcon } from '@mui/icons-material';
import { useTranslations } from 'next-intl';

export default function CustomNoRowsOverlay() {
  const t = useTranslations("Layout.common");
  
  return (
    <Stack
      sx={{
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 0.5,
        py: 4
      }}
      spacing={1}
    >
      <EmptyIcon sx={{ fontSize: 48 }} />
      <Typography variant="body1" sx={{ fontWeight: 600 }}>
        {t("noData")}
      </Typography>
      <Typography variant="body2">
        {t("noDataSub")}
      </Typography>
    </Stack>
  );
}
