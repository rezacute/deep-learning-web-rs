use actix_multipart::Multipart;
use actix_web::web::{Data, Path};
use actix_web::{HttpResponse, ResponseError};
use create_rust_app::{Attachment, AttachmentBlob, AttachmentData, Database, Storage};
use futures_util::{StreamExt as _, TryFutureExt};
use serde::Serialize;

use anyhow::{bail, Result};
use tokio::fs;
use std::fs::File;
use std::io::Write;
use std::string;
use tch::vision::imagenet;

use tensorflow::{Graph, ImportGraphDefOptions, Session, SessionOptions, SessionRunArgs, Tensor};

use std::path::PathBuf;
use structopt::StructOpt;

use image::{GenericImageView, Rgba};
use imageproc::drawing::draw_hollow_rect_mut;
use imageproc::rect::Rect;
const LINE_COLOUR: Rgba<u8> = Rgba([0, 255, 0, 0]);
use std::time::{SystemTime,UNIX_EPOCH};

#[derive(StructOpt)]
struct Opt {
    #[structopt(parse(from_os_str))]
    input: PathBuf,

    #[structopt(parse(from_os_str))]
    output: PathBuf,
}
#[tsync::tsync]
#[derive(Serialize,Copy, Clone, Debug)]
// Make it a bit nicer to work with the results, by adding a more explanatory struct
pub struct BBox {
    pub x1: f32,
    pub y1: f32,
    pub x2: f32,
    pub y2: f32,
    pub prob: f32,
}

#[derive(Serialize)]
#[tsync::tsync]
struct FileInfo {
    pub id: i32,
    pub key: String,
    pub name: String,
    pub url: Option<String>,
}

#[actix_web::get("")]
async fn all(db: Data<Database>, storage: Data<Storage>) -> HttpResponse {
    let mut db = db.pool.get().unwrap();
    let files = Attachment::find_all_for_record(&mut db, "file".to_string(), "NULL".to_string(), 0)
        .unwrap_or_default();
    let blob_ids = files.iter().map(|f| f.blob_id).collect::<Vec<_>>();
    let blobs = AttachmentBlob::find_all_by_id(&mut db, blob_ids).unwrap_or_default();

    let mut files = blobs
        .iter()
        .enumerate()
        .map(|b| FileInfo {
            id: files[b.0].id,
            key: b.1.clone().key,
            name: b.1.clone().file_name,
            url: None,
        })
        .collect::<Vec<FileInfo>>();

    for info in files.iter_mut() {
        let uri = storage.download_uri(info.key.clone(), None).await;
        if uri.is_err() {
            return HttpResponse::InternalServerError().json(uri.err().unwrap());
        }
        let uri = uri.unwrap();
        info.url = Some(uri);
    }

    HttpResponse::Ok().json(files)
}

#[actix_web::delete("/{id}")]
async fn delete(db: Data<Database>, storage: Data<Storage>, file_id: Path<i32>) -> HttpResponse {
    let mut db = db.pool.get().unwrap();
    let file_id = file_id.into_inner();

    let detach_op = Attachment::detach(&mut db, &storage, file_id).await;

    if detach_op.is_err() {
        return HttpResponse::InternalServerError().json(detach_op.err().unwrap());
    }

    HttpResponse::Ok().finish()
}

#[actix_web::post("")]
async fn create(mut payload: Multipart) -> HttpResponse {
    while let Some(item) = payload.next().await {
        let mut field = if item.is_ok() {
            item.unwrap()
        } else {
            let err = item.err().unwrap();
            return err.error_response();
        };

        let content_disposition = field.content_disposition();
        let file_name = content_disposition.get_filename().map(|f| f.to_string());
        let field_name = content_disposition.get_name().unwrap();

        match field_name {
            "file" => {
                let mut data = Vec::new();
                while let Some(chunk) = field.next().await {
                    data.extend_from_slice(&chunk.unwrap()[..]);
                }

                let mut f = File::create("test.jpg").expect("Unable to create file");
                f.write_all(&data).expect("Unable to write data");
                // Load the image file and resize it to the usual imagenet dimension of 224x224.
                let image = imagenet::load_image_and_resize224("test.jpg").unwrap();

                // Load the Python saved module.
                let model = tch::CModule::load("model.pt").unwrap();

                // Apply the forward pass of the model to get the logits.
                let output = image
                    .unsqueeze(0)
                    .apply(&model)
                    .softmax(-1, tch::Kind::Float);

                    let mut result:  Vec<String> = vec![];

                // Print the top 5 categories for this image.
                for (probability, class) in imagenet::top(&output, 5).iter() {
                    println!("{:50} {:5.2}%", class, 100.0 * probability);
                    result.push(format!("{:50} {:5.2}%", class, 100.0 * probability));
                }

                return HttpResponse::Ok().json(result);
                // let attached_req = Attachment::attach(&mut db, &store, "file".to_string(), "NULL".to_string(), 0, AttachmentData {
                //     data,
                //     file_name
                // }, true, false).await;

                // if attached_req.is_err() {
                //     return HttpResponse::InternalServerError().json(attached_req.err().unwrap());
                // }
            }
            _ => {}
        }
    }

    HttpResponse::Ok().finish()
}

#[actix_web::post("/face")]
async fn face_detect(mut payload: Multipart) -> HttpResponse {
    while let Some(item) = payload.next().await {
        let mut field = if item.is_ok() {
            item.unwrap()
        } else {
            let err = item.err().unwrap();
            return err.error_response();
        };

        let content_disposition = field.content_disposition();
        let file_name = content_disposition.get_filename().map(|f| f.to_string());
        let field_name = content_disposition.get_name().unwrap();

        match field_name {
            "file" => {
                let mut data = Vec::new();
                while let Some(chunk) = field.next().await {
                    data.extend_from_slice(&chunk.unwrap()[..]);
                }

                let mut f = File::create("test.jpg").expect("Unable to create file");
                f.write_all(&data).expect("Unable to write data");
                //First, we load up the graph as a byte array
                let model = include_bytes!("mtcnn.pb");

                //Then we create a tensorflow graph from the model
                let mut graph = Graph::new();
                graph.import_graph_def(&*model, &ImportGraphDefOptions::new()).unwrap();

                let input_image = image::open(PathBuf::from("test.jpg")).unwrap();

                let mut flattened: Vec<f32> = Vec::new();

                for (_x, _y, rgb) in input_image.pixels() {
                    flattened.push(rgb[2] as f32);
                    flattened.push(rgb[1] as f32);
                    flattened.push(rgb[0] as f32);
                }

                //The `input` tensor expects BGR pixel data.
                let input =
                    Tensor::new(&[input_image.height() as u64, input_image.width() as u64, 3])
                        .with_values(&flattened).unwrap();

                //Use input params from the existing module
                let min_size = Tensor::new(&[]).with_values(&[20f32]).unwrap();
                let thresholds = Tensor::new(&[3]).with_values(&[0.6f32, 0.7f32, 0.7f32]).unwrap();
                let factor = Tensor::new(&[]).with_values(&[0.709f32]).unwrap();

                let mut args = SessionRunArgs::new();

                //Load default parameters
                args.add_feed(&graph.operation_by_name_required("min_size").unwrap(), 0, &min_size);
                args.add_feed(
                    &graph.operation_by_name_required("thresholds").unwrap(),
                    0,
                    &thresholds,
                );
                args.add_feed(&graph.operation_by_name_required("factor").unwrap(), 0, &factor);

                //Load our input image
                args.add_feed(&graph.operation_by_name_required("input").unwrap(), 0, &input);

                //Request the following outputs after the session runs
                let bbox = args.request_fetch(&graph.operation_by_name_required("box").unwrap(), 0);
                let prob = args.request_fetch(&graph.operation_by_name_required("prob").unwrap(), 0);

                let session = Session::new(&SessionOptions::new(), &graph).unwrap();

                session.run(&mut args).unwrap();

                //Our bounding box extents
                let bbox_res: Tensor<f32> = args.fetch(bbox).unwrap();
                //Our facial probability
                let prob_res: Tensor<f32> = args.fetch(prob).unwrap();

                //Let's store the results as a Vec<BBox>
                let bboxes: Vec<_> = bbox_res
                    .chunks_exact(4) // Split into chunks of 4
                    .zip(prob_res.iter()) // Combine it with prob_res
                    .map(|(bbox, &prob)| BBox {
                        y1: bbox[0],
                        x1: bbox[1],
                        y2: bbox[2],
                        x2: bbox[3],
                        prob,
                    })
                    .collect();
                
                // println!("BBox Length: {}, BBoxes:{:#?}", bboxes.len(), bboxes);

                // //We want to change input_image since it is not needed.
                let mut output_image = input_image.to_rgba8();

                //Iterate through all bounding boxes
                for bbox in bboxes {
                    //Create a `Rect` from the bounding box.
                    let rect = Rect::at(bbox.x1 as i32, bbox.y1 as i32)
                        .of_size((bbox.x2 - bbox.x1) as u32, (bbox.y2 - bbox.y1) as u32);

                    //Draw a green line around the bounding box
                    draw_hollow_rect_mut(&mut output_image, rect, LINE_COLOUR);
                }

                //Once we've modified the image we save it in the output location.
                let output_file = PathBuf::from("frontend/public/images/facedetect.jpg");
                output_image.save(&output_file).unwrap();
                let now = SystemTime::now().duration_since(UNIX_EPOCH)
                .unwrap()
                .as_millis();
                fs::remove_dir_all(PathBuf::from("frontend/public/images/facedetect")).unwrap_or_else(|_| ()).await;

                fs::create_dir(PathBuf::from("frontend/public/images/facedetect")).unwrap_or_else(|_| ()).await;
                fs::hard_link(&output_file, format!("frontend/public/images/facedetect/{:?}.jpg",now)).unwrap_or_else(|_| ()).await;
                #[derive(Serialize)]
                struct MyObj {
                    id: String,
                }
                return HttpResponse::Ok().json(MyObj{id:format!("{:?}",now)});
                // let attached_req = Attachment::attach(&mut db, &store, "file".to_string(), "NULL".to_string(), 0, AttachmentData {
                //     data,
                //     file_name
                // }, true, false).await;

                // if attached_req.is_err() {
                //     return HttpResponse::InternalServerError().json(attached_req.err().unwrap());
                // }
            }
            _ => {}
        }
    }

    HttpResponse::Ok().finish()
}
pub fn endpoints(scope: actix_web::Scope) -> actix_web::Scope {
    return scope.service(create).service(all).service(delete).service(face_detect);
}
