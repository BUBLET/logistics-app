import os

def generate_structure_md(root_dir, output_file='structure.md', exclude_dirs=None):
    """
    Генерирует файл Markdown с структурой папок и файлов, исключая указанные директории.

    :param root_dir: Корневая директория проекта
    :param output_file: Имя выходного Markdown файла
    :param exclude_dirs: Список директорий для исключения
    """
    if exclude_dirs is None:
        exclude_dirs = []

    with open(output_file, 'w', encoding='utf-8') as md_file:
        md_file.write(f"# Структура проекта: {os.path.abspath(root_dir)}\n\n")
        for root, dirs, files in os.walk(root_dir):
            # Исключаем указанные директории из обхода
            dirs[:] = [d for d in dirs if d not in exclude_dirs]

            # Определяем уровень вложенности
            relative_path = os.path.relpath(root, root_dir)
            if relative_path == '.':
                level = 0
            else:
                level = relative_path.count(os.sep)
            indent = '    ' * level
            folder_name = os.path.basename(root) if os.path.basename(root) else os.path.basename(root_dir)
            md_file.write(f"{indent}- **{folder_name}/**\n")
            sub_indent = '    ' * (level + 1)
            for file in files:
                md_file.write(f"{sub_indent}- {file}\n")

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Генерация структуры проекта в Markdown формате.")
    parser.add_argument('directory', nargs='?', default='.', help='Путь к корневой директории проекта (по умолчанию текущая директория)')
    parser.add_argument('-o', '--output', default='structure.md', help='Имя выходного Markdown файла')
    parser.add_argument('-e', '--exclude', nargs='*', default=['node_modules', '.vscode', 'test', '.git', '__pycache__'], help='Список директорий для исключения')

    args = parser.parse_args()
    generate_structure_md(args.directory, args.output, args.exclude)
    print(f"Структура проекта сохранена в {args.output}")
