import React, { SyntheticEvent, useMemo, useState } from 'react';
import { useQuery } from '@apollo/client';
import MuiAccordion, { AccordionProps } from '@mui/material/Accordion';
import MuiAccordionSummary, { AccordionSummaryProps } from '@mui/material/AccordionSummary';
import {
  AccordionDetails,
  Box,
  Stack,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { FaqCategory, FaqStatus } from '../../enums/faq.enum';
import { GET_FAQS } from '../../../apollo/admin/query';

const Accordion = styled((props: AccordionProps) => (
  <MuiAccordion disableGutters elevation={0} square {...props} />
))(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  '&:not(:last-child)': {
    borderBottom: 0,
  },
  '&:before': {
    display: 'none',
  },
}));

const AccordionSummary = styled((props: AccordionSummaryProps) => (
  <MuiAccordionSummary expandIcon={<KeyboardArrowDownRoundedIcon sx={{ fontSize: '1.4rem' }} />} {...props} />
))(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, .05)' : '#fff',
  '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
    transform: 'rotate(180deg)',
  },
  '& .MuiAccordionSummary-content': {
    marginLeft: theme.spacing(1),
  },
}));

// ✅ Category label map
const categoryLabels: Record<FaqCategory, string> = {
	PRODUCT: 'Product',
	PAYMENT: 'Payment',
	FOR_BUYERS: 'For Buyers',
	FOR_STORES: 'For Sellers',
	MEMBERSHIP: 'Membership',
	COMMUNITY: 'Community',
	OTHERS: 'Other',
	[FaqCategory.GENERAL]: '',
};

const Faq = () => {
  const device = useDeviceDetect();
  const [category, setCategory] = useState<FaqCategory>(FaqCategory.PRODUCT);
  const [expanded, setExpanded] = useState<string | false>(false);

  const { data, loading } = useQuery(GET_FAQS, {
    fetchPolicy: 'network-only',
  });

  // ✅ Group FAQs by category
  const groupedFaqs = useMemo(() => {
    if (!data?.getAllFaqs) return {};
    const grouped: Record<string, any[]> = {};
    for (const faq of data.getAllFaqs) {
      if (faq.status !== FaqStatus.ACTIVE) continue;
      if (!grouped[faq.category]) grouped[faq.category] = [];
      grouped[faq.category].push(faq);
    }
    return grouped;
  }, [data]);

  const handleChange = (panel: string) => (event: SyntheticEvent, newExpanded: boolean) => {
    setExpanded(newExpanded ? panel : false);
  };

  if (device === 'mobile') return <div>FAQ MOBILE</div>;

  return (
    <Stack className="faq-content">
      <Box className="categories" component="div">
        {Object.entries(categoryLabels).map(([key, label]) => (
          <div
            key={key}
            className={category === key ? 'active' : ''}
            onClick={() => setCategory(key as FaqCategory)}
          >
            {label}
          </div>
        ))}
      </Box>

      <Box className="wrap" component="div">
        {loading && <Typography>Loading...</Typography>}
        {!loading && groupedFaqs[category] && groupedFaqs[category].length > 0 ? (
          groupedFaqs[category].map((ele: any) => (
            <Accordion
              expanded={expanded === ele._id}
              onChange={handleChange(ele._id)}
              key={ele._id}
            >
              <AccordionSummary id="panel1d-header" className="question" aria-controls="panel1d-content">
                <Typography className="badge" variant="h4">Q</Typography>
                <Typography>{ele.question}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack className="answer flex-box">
                  <Typography className="badge" variant="h4" color="primary">A</Typography>
                  <Typography>{ele.answer}</Typography>
                </Stack>
              </AccordionDetails>
            </Accordion>
          ))
        ) : (
          <Typography>No FAQs in this category.</Typography>
        )}
      </Box>
    </Stack>
  );
};

export default Faq;
