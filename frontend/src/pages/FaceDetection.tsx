import React, { useState } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import { styled } from "@mui/material/styles";
import FileUpload, { FileObject } from "react-mui-fileuploader";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import Button from "@mui/material/Button";
const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
}));
// Just some styles
const styles = {
    image: { maxWidth: "100%", maxHeight: 320 },
    preview: {
      marginTop: 50,
      display: "flex",
      flexDirection: "column",
    }
  };
  const FilesAPI = {
    all: async () =>
        await (await fetch(`/api/files`)).json(),
    create: async (formData: FormData) =>
    await (await fetch('/api/files/face', {
            method: 'POST',
            body: formData,
        })).json(),
    delete: async (id: number) =>
        await fetch(`/api/files/${id}`, { method: 'DELETE' })
}
export const FaceDetection = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const handleFileUploadError = (_error: any) => {
    // Do something...
  };

  const createFile = async (form: FormData) => {
    setSelectedImage(null);
    //setProcessing(true)
    const result:any = await FilesAPI.create(form)
    //setFiles(await FilesAPI.all())
    
    setSelectedImage("http://localhost:3000/images/facedetect/"+result.id+".jpg")
    //setProcessing(false)
}
  const handleFilesChange = (files: Array<FileObject>) => {
    // Do something...
    if(files[0])
    setSelectedImage(files[0].path);
    else{
        setSelectedImage(null);
    }
  };
  return (
    <Box sx={{ width: "100%" }}>
      <Stack spacing={2}>
        <Item>
          <div style={{ width: "100%" }}>
            <h1>Face Detection</h1>
          </div>
        </Item>
        {selectedImage && (
          <div style={{ maxWidth: "100%", maxHeight: 320 }}>
            <img
              src={selectedImage}
              style={styles.image}
              alt="Thumb"
            />
            
          </div>
        )}
        <div id="uploader">
        <FileUpload
        
          multiFile={true}
          disabled={false}
          title=""
          header="[Drag to drop]"
          leftLabel="or"
          rightLabel="to select files"
          buttonLabel="click here"
          buttonRemoveLabel="Remove all"
          maxFileSize={10}
          maxUploadFiles={1}
          errorSizeMessage={
            "fill it or remove it to use the default error message"
          }
          allowedExtensions={["jpg", "jpeg"]}
          onFilesChange={handleFilesChange}
          onError={handleFileUploadError}
          imageSrc={"images/logo512.png"}
          bannerProps={selectedImage?{sx:{display:'none'}}:{ elevation: 0, variant: "outlined" }}
          containerProps={{ elevation: 0, variant: "outlined" }}
        />
        </div>
       
        {selectedImage && (<><Button
          style={{ width: "100%" }}
          variant="outlined"
          startIcon={<KeyboardDoubleArrowLeftIcon />}
          endIcon={<KeyboardDoubleArrowRightIcon />}
          onClick={() => {
            const div1 = document.getElementById("uploader");
        const div1Paras = div1!.getElementsByTagName("input");
        const num = div1Paras.length;
        console.log("****",num);
        
            const form = new FormData()
            const el = div1Paras[0]
            form.append("file", el.files![0])
            createFile(form)
        }}
        >
          Process
        </Button></>)}
      </Stack>
    </Box>
  );
};
