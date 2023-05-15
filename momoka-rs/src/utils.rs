use chrono::Utc;

/// Gets the current UTC time as a formatted string.
///
/// The formatted string follows the format "Tue, 31 May 2022 13:45:00 GMT".
///
/// # Returns
///
/// A `String` containing the formatted UTC time.
pub fn get_current_utc_string() -> String {
    let current_time = Utc::now();
    let formatted_time = current_time.format("%a, %d %b %Y %H:%M:%S GMT").to_string();

    formatted_time
}
