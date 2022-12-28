#[macro_use]
extern crate diesel;

use actix_files::{Files};
use actix_web::{App, HttpServer, web};
use actix_web::middleware::{Compress, Logger, NormalizePath};
use actix_web::web::Data;

mod schema;
mod services;
mod models;
mod mail;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let app_data = create_rust_app::setup();

    HttpServer::new(move || {
        let mut app = App::new()
            .wrap(Compress::default())
            .wrap(NormalizePath::trim())
            .wrap(Logger::default());

        app = app.app_data(Data::new(app_data.database.clone()));
        app = app.app_data(Data::new(app_data.mailer.clone()));
        app = app.app_data(Data::new(app_data.storage.clone()));

        let mut api_scope = web::scope("/api");
        api_scope = api_scope.service(services::file::endpoints(web::scope("/files")));
        api_scope = api_scope.service(create_rust_app::auth::endpoints(web::scope("/auth")));
        api_scope = api_scope.service(services::todo::endpoints(web::scope("/todos")));

        #[cfg(debug_assertions)]
        {
            /* Development-only routes */
            // Mount development-only API routes
            api_scope = api_scope.service(create_rust_app::dev::endpoints(web::scope("/development")));
            // Mount the admin dashboard on /admin
            app = app.service(web::scope("/admin").service(Files::new("/", ".cargo/admin/dist/").index_file("admin.html")));
        }

        app = app.service(api_scope);
        app = app.default_service(web::get().to(create_rust_app::render_views));
        app
    }).bind("0.0.0.0:3000")?.run().await
}
