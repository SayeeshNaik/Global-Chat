import React, { useState, useRef, useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Box,
  Typography,
  CircularProgress,
  Slider,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

// Emoji palette - these will replace pixels
const EMOJI_PALETTE = [
  { emoji: '❤️', color: [255, 0, 0] },
  { emoji: '🧡', color: [255, 165, 0] },
  { emoji: '💛', color: [255, 255, 0] },
  { emoji: '💚', color: [0, 255, 0] },
  { emoji: '💙', color: [0, 0, 255] },
  { emoji: '💜', color: [128, 0, 128] },
  { emoji: '🖤', color: [0, 0, 0] },
  { emoji: '🤍', color: [255, 255, 255] },
  { emoji: '🤎', color: [139, 69, 19] },
  { emoji: '🔴', color: [255, 0, 0] },
  { emoji: '🟠', color: [255, 165, 0] },
  { emoji: '🟡', color: [255, 255, 0] },
  { emoji: '🟢', color: [0, 255, 0] },
  { emoji: '🔵', color: [0, 0, 255] },
  { emoji: '🟣', color: [128, 0, 128] },
  { emoji: '⚫', color: [0, 0, 0] },
  { emoji: '⚪', color: [255, 255, 255] },
  { emoji: '🟤', color: [139, 69, 19] },
  { emoji: '🌟', color: [255, 255, 100] },
  { emoji: '✨', color: [255, 255, 200] }

];

const ImageConverterDialog = ({openDialogue=false}) => {
  const [open, setOpen] = useState(openDialogue);
  const [selectedFile, setSelectedFile] = useState(null);
  const [emojiSize, setEmojiSize] = useState(2);
  const [convertedImage, setConvertedImage] = useState(null);
  const [isConverting, setIsConverting] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const emojiCanvasRef = useRef(null);

  // Find closest emoji for a given RGB color
  const findClosestEmoji = (r, g, b) => {
    let closestEmoji = '⬜';
    let minDistance = Infinity;

    EMOJI_PALETTE.forEach(({ emoji, color: [er, eg, eb] }) => {
      const distance = Math.sqrt(
        Math.pow(r - er, 2) + 
        Math.pow(g - eg, 2) + 
        Math.pow(b - eb, 2)
      );
      if (distance < minDistance) {
        minDistance = distance;
        closestEmoji = emoji;
      }
    });

    return closestEmoji;
  };

  const convertToEmojiArt = (imageData) => {
    return new Promise((resolve) => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Set canvas dimensions
        const scaleFactor = Math.min(1, 500 / Math.max(img.width, img.height));
        canvas.width = img.width * scaleFactor;
        canvas.height = img.height * scaleFactor;
        
        // Draw original image scaled down
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Create emoji grid
        const emojiCanvas = emojiCanvasRef.current;
        const emojiCtx = emojiCanvas.getContext('2d');
        
        // Calculate emoji grid size
        const gridWidth = Math.ceil(canvas.width / emojiSize);
        const gridHeight = Math.ceil(canvas.height / emojiSize);
        
        emojiCanvas.width = gridWidth * emojiSize;
        emojiCanvas.height = gridHeight * emojiSize;
        
        // Fill background
        emojiCtx.fillStyle = 'white';
        emojiCtx.fillRect(0, 0, emojiCanvas.width, emojiCanvas.height);
        
        // Set font for emojis
        emojiCtx.font = `${emojiSize}px Arial`;
        emojiCtx.textAlign = 'center';
        emojiCtx.textBaseline = 'middle';
        
        // Process each grid cell
        for (let y = 0; y < gridHeight; y++) {
          for (let x = 0; x < gridWidth; x++) {
            // Get average color in this cell
            let r = 0, g = 0, b = 0, count = 0;
            
            for (let py = 0; py < emojiSize; py++) {
              for (let px = 0; px < emojiSize; px++) {
                const pxPos = (y * emojiSize + py) * canvas.width * 4 + (x * emojiSize + px) * 4;
                if (pxPos < data.length) {
                  r += data[pxPos];
                  g += data[pxPos + 1];
                  b += data[pxPos + 2];
                  count++;
                }
              }
            }
            
            if (count > 0) {
              r = Math.round(r / count);
              g = Math.round(g / count);
              b = Math.round(b / count);
              
              // Find matching emoji
              const emoji = findClosestEmoji(r, g, b);
              
              // Draw emoji
              emojiCtx.fillStyle = `rgb(${r},${g},${b})`;
              emojiCtx.fillText(
                emoji, 
                x * emojiSize + emojiSize/2, 
                y * emojiSize + emojiSize/2
              );
            }
          }
        }
        
        resolve(emojiCanvas.toDataURL());
      };
      
      img.src = imageData;
    });
  };

  const handleOpen = () => {
    setOpen(true);
    setSelectedFile(null);
    setConvertedImage(null);
    setPreviewImage(null);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.match('image.*')) {
        alert('Please select an image file (JPEG, PNG, etc.)');
        return;
      }
      setSelectedFile(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target.result);
        setConvertedImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConvert = async () => {
    if (!selectedFile || !previewImage) {
      alert('Please select an image file first');
      return;
    }

    setIsConverting(true);
    
    try {
      const convertedData = await convertToEmojiArt(previewImage);
      setConvertedImage(convertedData);
    } catch (error) {
      console.error('Conversion error:', error);
      alert('Conversion failed. Please try again.');
    } finally {
      setTimeout(() => {
        setIsConverting(false);
      }, 2000);
    }
  };

  const handleDownload = () => {
    if (!convertedImage) return;
    
    const link = document.createElement('a');
    link.href = convertedImage;
    link.download = `emoji-art-${selectedFile.name.replace(/\.[^/.]+$/, '')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div>
      {/* Hidden canvases for processing */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <canvas ref={emojiCanvasRef} style={{ display: 'none' }} />
      
      {/* <Button variant="contained" color="primary" onClick={handleOpen}>
        Create Emoji Art
      </Button> */}

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{background:'#535353', color: 'white', textAlign:'center', marginBottom:2}}>Image to Emoji Art Converter</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              style={{ display: 'none' }}
            />
            
            <Button
              variant="outlined"
              color="primary"
              startIcon={<CloudUploadIcon />}
              onClick={triggerFileInput}
              fullWidth
              sx={{ py: 2 }}
            >
              {selectedFile ? selectedFile.name : 'Upload Image'}
            </Button>
            
            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
              Only image files are allowed (JPEG, PNG, etc.)
            </Typography>
          </Box>

          {previewImage && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>Preview</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" align="center">Original</Typography>
                  <Box
                    component="img"
                    src={previewImage}
                    alt="Original preview"
                    sx={{ 
                      width: '77vw', 
                      height: 'auto',
                      border: '1px solid #ddd',
                      borderRadius: 1,
                      boxShadow: '8px 8px 15px black'
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>

                  {isConverting ? (
                    <Box 
                      sx={{
                        width: '77vw',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: 200,
                        border: '1px dashed #ddd',
                        borderRadius: 1
                      }}
                    >
                      {/* <CircularProgress /> */}
                      <div class="loader"></div>
                    </Box>
                  ) : convertedImage && (
                    <>
                    <Typography variant="subtitle2" align="center">Emoji Art</Typography>
                      <Box
                        component="img"
                        src={convertedImage}
                        alt="Emoji art preview"
                        sx={{ 
                          width: '77vw', 
                          height: 'auto',
                          border: '1px solid #ddd',
                          borderRadius: 1,
                          imageRendering: 'pixelated',
                          boxShadow: '8px 8px 15px black'
                        }}
                      />
                      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                        <Button 
                          sx={{background: '#00ad00', borderRadius:'10px'}}
                          variant="contained" 
                          onClick={handleDownload}
                          startIcon={<FileDownloadIcon />}
                        >
                          Download
                        </Button>
                      </Box>
                    </>
                
                  )}
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button  variant='outlined' onClick={handleClose}>Cancel</Button>
          <Button 
            sx={{background: '#00a4e5'}}
            onClick={handleConvert} 
            variant="contained" 
            color="primary"
            disabled={!selectedFile || isConverting}
          >
            {isConverting ? 'Creating...' : 'Create Emoji Art'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ImageConverterDialog;