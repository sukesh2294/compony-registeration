import React, { useState } from "react";
import { Button, Box, LinearProgress } from "@mui/material";
import api from "../../utils/axios";

export default function ImageUpload({ label="Upload", onUploaded }) {
  const [loading, setLoading] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    setLoading(true);
    try {
      const res = await api.post("/api/company/upload-logo", fd, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      onUploaded(res.data.logoUrl || res.data.url || res.data.bannerUrl);
    } catch (err) {
      alert("Upload failed");
    } finally { setLoading(false); }
  };

  return (
    <Box>
      <Button variant="outlined" component="label">{label}<input hidden accept="image/*" type="file" onChange={handleFile}/></Button>
      {loading && <LinearProgress sx={{mt:1}}/>}
    </Box>
  );
}
