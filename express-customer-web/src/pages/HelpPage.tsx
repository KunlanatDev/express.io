import { useState } from "react";
import {
  Box,
  Typography,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
  TextField,
  Button,
  InputAdornment,
  Chip,
} from "@mui/material";
import {
  ExpandMore,
  SearchOutlined,
  LocalShipping,
  Payment,
  SupportAgent,
  PhoneInTalk,
  Chat,
  EmailOutlined,
  QuestionAnswer,
  InfoOutlined,
} from "@mui/icons-material";
import { useTheme, alpha } from "@mui/material/styles";

const categories = [
  {
    icon: LocalShipping,
    label: "การจัดส่ง",
    color: "#2563EB",
    count: 5,
  },
  {
    icon: Payment,
    label: "การชำระเงิน",
    color: "#7C3AED",
    count: 4,
  },
  {
    icon: SupportAgent,
    label: "บัญชีผู้ใช้",
    color: "#059669",
    count: 3,
  },
  {
    icon: InfoOutlined,
    label: "ข้อมูลทั่วไป",
    color: "#D97706",
    count: 6,
  },
];

const faqs = [
  {
    category: "การจัดส่ง",
    question: "ใช้เวลานานแค่ไหนในการจัดส่ง?",
    answer:
      "EXPRESS.IO ให้บริการจัดส่งด่วนภายใน 1–3 ชั่วโมงสำหรับในเมือง และ 1 วันทำการสำหรับต่างจังหวัด ขึ้นอยู่กับประเภทบริการที่เลือก",
  },
  {
    category: "การจัดส่ง",
    question: "สามารถติดตามพัสดุแบบเรียลไทม์ได้หรือไม่?",
    answer:
      "ได้เลย! เมื่อไรเดอร์รับพัสดุแล้ว คุณสามารถติดตามตำแหน่งแบบ Live บนหน้า 'ติดตาม' โดยใช้หมายเลขคำสั่งได้ทันที",
  },
  {
    category: "การจัดส่ง",
    question: "สามารถยกเลิกหรือเปลี่ยนที่อยู่หลังสั่งได้ไหม?",
    answer:
      "สามารถยกเลิกได้ภายใน 5 นาทีหลังจากสั่ง หากไรเดอร์ยังไม่รับงาน สำหรับการเปลี่ยนที่อยู่กรุณาติดต่อฝ่ายบริการลูกค้า",
  },
  {
    category: "การชำระเงิน",
    question: "รองรับวิธีชำระเงินอะไรบ้าง?",
    answer:
      "รองรับบัตรเครดิต/เดบิต, PromptPay, TrueMoney Wallet, LINE Pay และการโอนเงินผ่านธนาคาร",
  },
  {
    category: "การชำระเงิน",
    question: "หากพัสดุเสียหาย จะได้รับการชดเชยอย่างไร?",
    answer:
      "EXPRESS.IO ให้ความคุ้มครองสูงสุด 2,000 บาทต่อชิ้นโดยอัตโนมัติ สามารถซื้อประกันเพิ่มได้ถึง 50,000 บาท",
  },
  {
    category: "บัญชีผู้ใช้",
    question: "ลืมรหัสผ่านทำอย่างไร?",
    answer:
      "กดที่ 'ลืมรหัสผ่าน' ในหน้าเข้าสู่ระบบ ระบบจะส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลที่ลงทะเบียนไว้",
  },
  {
    category: "ข้อมูลทั่วไป",
    question: "EXPRESS.IO ให้บริการในพื้นที่ไหนบ้าง?",
    answer:
      "ปัจจุบันให้บริการครอบคลุม 77 จังหวัดทั่วประเทศไทย โดยบริการด่วนพิเศษ (same-day) ให้บริการในกรุงเทพฯ และปริมณฑล",
  },
  {
    category: "ข้อมูลทั่วไป",
    question: "น้ำหนักและขนาดพัสดุสูงสุดที่รับได้คือเท่าไร?",
    answer:
      "น้ำหนักสูงสุด 20 กิโลกรัม ขนาดไม่เกิน 100 x 60 x 60 ซม. สำหรับพัสดุขนาดใหญ่กว่านี้กรุณาติดต่อฝ่ายบริการลูกค้าเพื่อขอใช้บริการ Bulk Logistics",
  },
];

const HelpPage = () => {
  const theme = useTheme();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | false>(false);

  const filtered = faqs.filter((faq) => {
    const matchSearch =
      !search ||
      faq.question.toLowerCase().includes(search.toLowerCase()) ||
      faq.answer.toLowerCase().includes(search.toLowerCase());
    const matchCat = !selectedCategory || faq.category === selectedCategory;
    return matchSearch && matchCat;
  });

  return (
    <Box>
      {/* HERO */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.12)} 0%, ${alpha(theme.palette.primary.light, 0.06)} 100%)`,
          borderRadius: 4,
          py: { xs: 4, md: 6 },
          px: { xs: 2, md: 4 },
          mb: { xs: 3, md: 5 },
          textAlign: "center",
          border: "1px solid",
          borderColor: alpha(theme.palette.primary.main, 0.15),
        }}
      >
        <QuestionAnswer
          sx={{
            fontSize: 56,
            color: "primary.main",
            mb: 2,
            filter: "drop-shadow(0 4px 12px rgba(37,99,235,0.3))",
          }}
        />
        <Typography
          variant="h4"
          fontWeight={800}
          sx={{ mb: 1, color: "text.primary" }}
        >
          ศูนย์ช่วยเหลือ
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mb: 3, maxWidth: 480, mx: "auto" }}
        >
          มีคำถามอะไร? เราพร้อมช่วยคุณเสมอ ค้นหาคำตอบได้ที่นี่
        </Typography>

        {/* Search */}
        <TextField
          placeholder="ค้นหาคำถามที่พบบ่อย..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ maxWidth: 480, width: "100%" }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchOutlined color="action" />
              </InputAdornment>
            ),
            sx: {
              borderRadius: "12px",
              bgcolor: "background.paper",
              boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
            },
          }}
        />
      </Box>

      {/* CATEGORIES */}
      <Stack direction="row" flexWrap="wrap" gap={2} sx={{ mb: 4 }}>
        {categories.map((cat) => (
          <Box
            key={cat.label}
            sx={{ flex: "1 1 calc(25% - 12px)", minWidth: 140 }}
          >
            <Paper
              onClick={() =>
                setSelectedCategory(
                  selectedCategory === cat.label ? null : cat.label,
                )
              }
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 3,
                border: "2px solid",
                borderColor:
                  selectedCategory === cat.label ? cat.color : "divider",
                cursor: "pointer",
                transition: "all 0.2s",
                bgcolor:
                  selectedCategory === cat.label
                    ? alpha(cat.color, 0.06)
                    : "background.paper",
                "&:hover": {
                  borderColor: cat.color,
                  transform: "translateY(-2px)",
                  boxShadow: `0 8px 24px ${alpha(cat.color, 0.15)}`,
                },
              }}
            >
              <Stack spacing={1} alignItems="center" textAlign="center">
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: "14px",
                    bgcolor: alpha(cat.color, 0.1),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <cat.icon sx={{ color: cat.color, fontSize: 24 }} />
                </Box>
                <Typography fontWeight={700} sx={{ color: "text.primary" }}>
                  {cat.label}
                </Typography>
                <Chip
                  label={`${cat.count} คำถาม`}
                  size="small"
                  sx={{
                    bgcolor: alpha(cat.color, 0.1),
                    color: cat.color,
                    fontWeight: 600,
                    fontSize: "0.7rem",
                  }}
                />
              </Stack>
            </Paper>
          </Box>
        ))}
      </Stack>

      {/* FAQ ACCORDION */}
      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
        คำถามที่พบบ่อย
        {selectedCategory && (
          <Chip
            label={selectedCategory}
            size="small"
            onDelete={() => setSelectedCategory(null)}
            sx={{ ml: 1.5, fontWeight: 600 }}
            color="primary"
          />
        )}
      </Typography>

      <Stack spacing={1.5} sx={{ mb: 6 }}>
        {filtered.length === 0 ? (
          <Box textAlign="center" py={6}>
            <Typography color="text.secondary">
              ไม่พบคำถามที่ตรงกับการค้นหา
            </Typography>
          </Box>
        ) : (
          filtered.map((faq, idx) => (
            <Accordion
              key={idx}
              expanded={expanded === `faq-${idx}`}
              onChange={(_, isExpanded) =>
                setExpanded(isExpanded ? `faq-${idx}` : false)
              }
              elevation={0}
              sx={{
                border: "1px solid",
                borderColor:
                  expanded === `faq-${idx}` ? "primary.main" : "divider",
                borderRadius: "12px !important",
                "&:before": { display: "none" },
                transition: "all 0.2s",
                "&.Mui-expanded": {
                  boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.1)}`,
                },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMore />}
                sx={{ px: 3, py: 1 }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Chip
                    label={faq.category}
                    size="small"
                    sx={{ fontWeight: 600, fontSize: "0.7rem" }}
                    variant="outlined"
                    color="primary"
                  />
                  <Typography fontWeight={600}>{faq.question}</Typography>
                </Stack>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 3, pb: 2.5 }}>
                <Typography color="text.secondary" sx={{ lineHeight: 1.8 }}>
                  {faq.answer}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))
        )}
      </Stack>

      {/* CONTACT */}
      <Box
        sx={{
          bgcolor: "background.paper",
          borderRadius: 4,
          p: { xs: 3, md: 4 },
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography
          variant="h6"
          fontWeight={700}
          textAlign="center"
          sx={{ mb: 1 }}
        >
          ยังไม่พบคำตอบที่ต้องการ?
        </Typography>
        <Typography color="text.secondary" textAlign="center" sx={{ mb: 4 }}>
          ทีมงานของเราพร้อมช่วยเหลือคุณตลอด 24 ชั่วโมง
        </Typography>
        <Stack direction="row" flexWrap="wrap" gap={2} justifyContent="center">
          {[
            {
              icon: PhoneInTalk,
              label: "โทรหาเรา",
              sub: "02-XXX-XXXX",
              color: "#2563EB",
              action: "โทรเลย",
            },
            {
              icon: Chat,
              label: "แชทสด",
              sub: "ตอบภายใน 2 นาที",
              color: "#059669",
              action: "เริ่มแชท",
            },
            {
              icon: EmailOutlined,
              label: "อีเมล",
              sub: "support@express.io",
              color: "#7C3AED",
              action: "ส่งอีเมล",
            },
          ].map((ch) => (
            <Box
              key={ch.label}
              sx={{ flex: "1 1 calc(33.333% - 16px)", minWidth: 220 }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "divider",
                  textAlign: "center",
                  transition: "all 0.2s",
                  "&:hover": {
                    borderColor: ch.color,
                    transform: "translateY(-2px)",
                    boxShadow: `0 8px 24px ${alpha(ch.color, 0.15)}`,
                  },
                }}
              >
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: "16px",
                    bgcolor: alpha(ch.color, 0.1),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mx: "auto",
                    mb: 2,
                  }}
                >
                  <ch.icon sx={{ color: ch.color, fontSize: 28 }} />
                </Box>
                <Typography fontWeight={700} sx={{ mb: 0.5 }}>
                  {ch.label}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  {ch.sub}
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  sx={{
                    borderRadius: "8px",
                    borderColor: ch.color,
                    color: ch.color,
                    fontWeight: 600,
                    textTransform: "none",
                    "&:hover": {
                      bgcolor: alpha(ch.color, 0.08),
                      borderColor: ch.color,
                    },
                  }}
                >
                  {ch.action}
                </Button>
              </Paper>
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  );
};

export default HelpPage;
