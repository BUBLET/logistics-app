import os

def collect_files(root_dir, target_dirs, target_files):
    """
    Собирает пути к файлам из указанных директорий и отдельных файлов.

    :param root_dir: Корневая директория проекта
    :param target_dirs: Список имен директорий для поиска файлов
    :param target_files: Список относительных путей к отдельным файлам
    :return: Список путей к найденным файлам
    """
    collected_files = []

    # Поиск файлов в целевых директориях
    for dir_name in target_dirs:
        for current_root, dirs, files in os.walk(root_dir):
            if os.path.basename(current_root) == dir_name:
                for file in files:
                    file_path = os.path.join(current_root, file)
                    collected_files.append(file_path)
                # Не рекурсивно ищем внутри других директорий с таким именем
                # Если требуется рекурсивный поиск, можно убрать `dirs[:] = []`
                dirs[:] = []  # Не углубляться дальше в поддиректории найденных папок

    # Добавление отдельных файлов
    for file_rel_path in target_files:
        file_path = os.path.join(root_dir, file_rel_path)
        if os.path.isfile(file_path):
            collected_files.append(file_path)
        else:
            print(f"Внимание: Файл {file_rel_path} не найден и будет пропущен.")

    return collected_files

def combine_files(file_paths, output_file):
    """
    Объединяет содержимое указанных файлов в один текстовый файл.

    :param file_paths: Список путей к файлам для объединения
    :param output_file: Имя выходного текстового файла
    """
    with open(output_file, 'w', encoding='utf-8') as outfile:
        for file_path in file_paths:
            outfile.write(f"\n\n===== Содержимое файла: {file_path} =====\n\n")
            try:
                with open(file_path, 'r', encoding='utf-8') as infile:
                    content = infile.read()
                    outfile.write(content)
            except Exception as e:
                outfile.write(f"Ошибка при чтении файла {file_path}: {e}\n")

    print(f"Все коды объединены в файл: {output_file}")

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Объединение кодов из определённых директорий и файлов в один текстовый файл.")
    parser.add_argument('directory', nargs='?', default='.', help='Путь к корневой директории проекта (по умолчанию текущая директория)')
    parser.add_argument('-d', '--directories', nargs='+', default=['frontend'], help='Список директорий для сбора файлов')
    parser.add_argument('-f', '--files', nargs='+', default=['Logistics.col'], help='Список отдельных файлов для включения (относительно корневой директории)')
    parser.add_argument('-o', '--output', default='combined_code.txt', help='Имя выходного текстового файла')

    args = parser.parse_args()

    root_directory = os.path.abspath(args.directory)
    target_directories = args.directories
    target_files = args.files
    output_filename = args.output

    print(f"Корневая директория проекта: {root_directory}")
    print(f"Целевые директории для сбора файлов: {target_directories}")
    print(f"Отдельные файлы для включения: {target_files}")
    print(f"Имя выходного файла: {output_filename}\n")

    # Сбор путей к файлам
    files_to_combine = collect_files(root_directory, target_directories, target_files)

    if not files_to_combine:
        print("Не найдено ни одного файла для объединения.")
    else:
        print(f"Найдено {len(files_to_combine)} файлов для объединения.")
        # Объединение файлов
        combine_files(files_to_combine, output_filename)
