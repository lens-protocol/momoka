use crate::utils::get_current_utc_string;

/// A logger for printing log messages in different colors.
pub struct Logger;

#[allow(dead_code)]
impl Logger {
    fn print_colored_message(&self, color_code: &str, content: &str) {
        println!(
            "{}LENS VERIFICATION NODE - {} - {}{}",
            color_code,
            get_current_utc_string(),
            content,
            "\x1b[0m"
        );
    }

    /// Prints an error message with the specified content in red.
    ///
    /// # Arguments
    ///
    /// * `content` - The content of the error message.
    pub fn error(&self, content: &str) {
        self.print_colored_message("\x1b[31m", content); // Red
    }

    /// Prints a warning message with the specified content in yellow.
    ///
    /// # Arguments
    ///
    /// * `content` - The content of the warning message.
    pub fn warning(&self, content: &str) {
        self.print_colored_message("\x1b[33m", content); // Yellow
    }

    /// Prints an informational message with the specified content in blue.
    ///
    /// # Arguments
    ///
    /// * `content` - The content of the informational message.
    pub fn info(&self, content: &str) {
        self.print_colored_message("\x1b[36m", content); // Blue
    }

    /// Prints a success message with the specified content in green.
    ///
    /// # Arguments
    ///
    /// * `content` - The content of the success message.
    pub fn success(&self, content: &str) {
        self.print_colored_message("\x1b[38;2;0;128;0m", content); // Green
    }
}
